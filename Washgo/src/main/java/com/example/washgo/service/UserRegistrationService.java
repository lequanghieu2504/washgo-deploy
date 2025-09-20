package com.example.washgo.service;

import com.example.washgo.dtos.UserCreateDTO;
import com.example.washgo.dtos.UserDTO;
import com.example.washgo.dtos.UserReadDTO;
import com.example.washgo.dtos.UserUpdateDTO;
import com.example.washgo.enums.GenderType;
import com.example.washgo.enums.GenderType;
import com.example.washgo.enums.OTPType;
import com.example.washgo.enums.UserRole;
import com.example.washgo.enums.emailStatus;
import com.example.washgo.mapper.LocationMapper; // Import LocationMapper
import com.example.washgo.mapper.UserMapper;
import com.example.washgo.model.*;
import com.example.washgo.repository.*;
import com.example.washgo.util.OTPGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.shaded.gson.annotations.Until;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.Email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
@Service
public class UserRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(UserRegistrationService.class);

	    private static final Pattern EMAIL_PATTERN = Pattern.compile(
	            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
	    );

	    private static final Pattern PHONE_PATTERN = Pattern.compile(
	    	    "^(\\+84|0)\\d{9,10}$"
	    	);

    private final UserInformationRepository userRepo;
    private final ClientProfileRepository clientRepo;
    private final CarwashProfileRepository carwashRepo;
    private final AdminProfileRepository adminRepo;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final MailService mailService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final VerificationOTPRepository verificationOTPRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserEmailRepository userEmailRepository; 
    private final OtpService otpService;

    // Removed GeocodingService injection

    @Autowired
    private ObjectMapper objectMapper; 
    public UserRegistrationService(OtpService otpService,UserInformationRepository userRepo,
                                   ClientProfileRepository clientRepo,
                                   CarwashProfileRepository carwashRepo,
                                   AdminProfileRepository adminRepo,
                                   PasswordEncoder passwordEncoder,
                                   UserMapper userMapper,MailService mailService,VerificationTokenRepository verificationTokenRepository, VerificationOTPRepository verificationOTPRepository,UserAccountRepository userAccountRepository,UserEmailRepository userEmailRepository) { // Removed GeocodingService
        this.userRepo = userRepo;
        this.clientRepo = clientRepo;
        this.carwashRepo = carwashRepo;
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.mailService = mailService;
        this.verificationTokenRepository= verificationTokenRepository;
        this.verificationOTPRepository = verificationOTPRepository;
        this.userAccountRepository = userAccountRepository;
        this.userEmailRepository = userEmailRepository;
        this.otpService = otpService;
    }

    // --- Consolidated Registration Method ---
	    @Transactional
	    public UserReadDTO registerUser(UserCreateDTO createDTO) {
	    	if(createDTO.getPhonenumber() != null) {
	    	String phone = createDTO.getPhonenumber().trim();
	    	}
	        // 1. Kiểm tra username và email trong UserAccountRepository
	        if (userAccountRepository.findByUsername(createDTO.getUsername()).isPresent()) {
	            throw new IllegalArgumentException("Username already exists: " + createDTO.getUsername());
	        }
	        if (userRepo.findByEmail(createDTO.getEmail()).isPresent()) {
	            throw new IllegalArgumentException("Email already exists: " + createDTO.getEmail());
	        }
	        if (!isValidEmail(createDTO.getEmail())) {
	            throw new IllegalArgumentException("Invalid email format provided during registration.");
	        }
	        if (createDTO.getPassword() == null || createDTO.getPassword().length() < 8) {
	            throw new IllegalArgumentException("Password must be at least 8 characters long during registration.");
	        }
	
	        Optional<UserInformation> optionalUserInfo = userRepo.findByPhoneNumber(createDTO.getPhonenumber());
	        UserAccount account = new UserAccount();
	        UserInformation userInfo;
	        UserInformation savedUserInfo;

	        if (optionalUserInfo.isPresent()) {
	            userInfo = optionalUserInfo.get();
	            System.out.println(userInfo.getPhoneNumber());
	            savedUserInfo = userInfo; 
	           
	            savedUserInfo.setEmail(createDTO.getEmail());
	            
	            
	            
	        } else {
	            userInfo = new UserInformation();
	            userInfo.setCreatedAt(LocalDateTime.now());
	            userInfo.setUpdatedAt(LocalDateTime.now());
	            userInfo.setEmail(createDTO.getEmail());
	            userInfo.setPhoneNumber(createDTO.getPhonenumber());
	            userInfo.setRole(createDTO.getRole());
	            savedUserInfo = userRepo.save(userInfo); 
	        }

	        // Tạo account và gán user đã lưu
	        account.setUsername(createDTO.getUsername());
	        account.setPasswordHash(passwordEncoder.encode(createDTO.getPassword()));

	        account.setUser(savedUserInfo);

	        // Lưu account
	        UserAccount savedAccount = userAccountRepository.save(account);

	        // Gán liên kết 2 chiều
	        savedUserInfo.setAccount(savedAccount);
	        userRepo.save(savedUserInfo);
	        
	        //gan email
	        if(createDTO.getEmail()!=null) {
		        UserEmail userEmail = new UserEmail();
		        userEmail.setEmailStatus(emailStatus.ACTIVE);
		        userEmail.setUserMail(createDTO.getEmail());
		        userEmailRepository.save(userEmail);	        	
	        }
	        
	        logger.info("Registered base user account: {}", account.getUsername());
	
	        // 4. Tạo profile tương ứng dựa trên role
	        switch (account.getUser().getRole()) {
	            case CLIENT:
	                ClientProfile clientProfile = new ClientProfile();
	                LocalDate defaultDate = LocalDate.of(1900, 1, 1);
	                clientProfile.setBirthDay(defaultDate);
	                clientProfile.setGender(GenderType.OTHER);
	                clientProfile.setUser(savedUserInfo);
	                clientRepo.save(clientProfile);
	                logger.info("Created Client profile for user: {}", account.getUsername());
	                break;
	            case CARWASH:
	                if (createDTO.getCarwashName() == null || createDTO.getCarwashName().isBlank() ||
	                        createDTO.getLocation() == null || createDTO.getLocation().isBlank()) {
	                    throw new IllegalArgumentException("Carwash name and location are required for CARWASH role.");
	                }
	                CarwashProfile carwashProfile = new CarwashProfile();
	                carwashProfile.setUser(savedUserInfo);
	                carwashProfile.setCarwashName(createDTO.getCarwashName());
	                carwashProfile.setLocation(createDTO.getLocation());
	                carwashProfile.setDescription(createDTO.getDescription());
	
	                LocationMapper locationMapper = new LocationMapper();
	                String latitude = locationMapper.convertToLatitude(createDTO.getLocation());
	                String longitude = locationMapper.convertToLongitude(createDTO.getLocation());
	
	                if (latitude != null && longitude != null) {
	                    carwashProfile.setLatitude(latitude);
	                    carwashProfile.setLongitude(longitude);
	                    logger.info("Geocoded location for {}: Lat={}, Lon={}", account.getUsername(), latitude, longitude);
	                } else {
	                    logger.warn("Could not geocode location for {}: {}", account.getUsername(), createDTO.getLocation());
	                }
	
	                carwashRepo.save(carwashProfile);
	                logger.info("Created Carwash profile for user: {}", account.getUsername());
	                break;
	            case ADMIN:
	                AdminProfile adminProfile = new AdminProfile();
	                adminProfile.setUser(savedUserInfo);
	                adminRepo.save(adminProfile);
	                logger.info("Created Admin profile for user: {}", account.getUsername());
	                break;
	            default:
	                throw new IllegalStateException("Unsupported user role: " + account.getUser().getRole());
	        }
	
	        // 5. Load lại UserInformation nếu cần và trả về DTO
	        UserInformation finalUserInfo = userRepo.findById(savedUserInfo.getId())
	                .orElseThrow(() -> new EntityNotFoundException("Failed to reload user after profile creation: " + savedUserInfo.getId()));
	        return userMapper.toUserReadDTO(finalUserInfo);
	    }


    // --- Update User ---
    @Transactional
    public UserReadDTO updateUser(Long userId, UserUpdateDTO updateDTO) {
        // 1. Lấy UserAccount theo userId
        UserAccount userAccount = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount not found with id: " + userId));

        // 2. Cập nhật email, password trong UserAccount
        updateDTO.getEmail().ifPresent(newEmail -> {
            if (!isValidEmail(newEmail)) {
                throw new IllegalArgumentException("Invalid email format provided for update.");
            }
            if (!newEmail.equalsIgnoreCase(userAccount.getUser().getEmail()) && userRepo.findByEmail(newEmail).isPresent()) {
                throw new IllegalArgumentException("Email already exists: " + newEmail);
            }
            userAccount.getUser().setEmail(newEmail);
            logger.info("Updating email for user ID {}", userId);
        });
        updateDTO.getPassword().ifPresent(rawPassword -> {
            if (!StringUtils.hasText(rawPassword) || rawPassword.length() < 8) {
                throw new IllegalArgumentException("Password must be at least 8 characters long for update.");
            }
            userAccount.setPasswordHash(passwordEncoder.encode(rawPassword));
            logger.info("Updating password for user ID {}", userId);
        });

        // 3. Cập nhật profile dựa trên role trong UserInformation (liên kết từ UserAccount)
        UserInformation userInfo = userAccount.getUser();

        if (userAccount.getUser().getRole() == UserRole.CARWASH && userInfo.getCarwashProfile() != null) {
            CarwashProfile profile = userInfo.getCarwashProfile();
            AtomicBoolean profileUpdated = new AtomicBoolean(false);
            AtomicBoolean locationChanged = new AtomicBoolean(false);
            final String[] newLocation = { profile.getLocation() };

            updateDTO.getCarwashName().ifPresent(name -> {
                if (StringUtils.hasText(name) && !name.equals(profile.getCarwashName())) {
                    profile.setCarwashName(name);
                    profileUpdated.set(true);
                } else if (!StringUtils.hasText(name)) {
                    throw new IllegalArgumentException("Carwash name cannot be empty during update.");
                }
            });
            updateDTO.getLocation().ifPresent(location -> {
                if (StringUtils.hasText(location) && !location.equals(profile.getLocation())) {
                    profile.setLocation(location);
                    newLocation[0] = location;
                    profileUpdated.set(true);
                    locationChanged.set(true);
                } else if (!StringUtils.hasText(location)) {
                    throw new IllegalArgumentException("Carwash location cannot be empty during update.");
                }
            });
            updateDTO.getDescription().ifPresent(desc -> {
                if (!Optional.ofNullable(desc).equals(Optional.ofNullable(profile.getDescription()))) {
                    profile.setDescription(desc);
                    profileUpdated.set(true);
                }
            });

            if (locationChanged.get()) {
                logger.info("Location changed for user {}, re-geocoding using LocationMapper: {}", userId, newLocation[0]);
                LocationMapper locationMapper = new LocationMapper();
                String latitude = locationMapper.convertToLatitude(newLocation[0]);
                String longitude = locationMapper.convertToLongitude(newLocation[0]);

                if (latitude != null && longitude != null) {
                    profile.setLatitude(latitude);
                    profile.setLongitude(longitude);
                    logger.info("Re-geocoded updated location for {}: Lat={}, Lon={}", userAccount.getUsername(), latitude, longitude);
                } else {
                    logger.warn("Could not re-geocode updated location for {}: {}", userAccount.getUsername(), newLocation[0]);
                    profile.setLatitude(null);
                    profile.setLongitude(null);
                }
                profileUpdated.set(true);
            }

            if (profileUpdated.get()) {
                carwashRepo.save(profile);
            }
        }

        // 4. Lưu UserAccount và UserInformation (thường chỉ cần lưu UserAccount vì cascade)
        userAccountRepository.save(userAccount);
        // Nếu cần thì có thể save userInfo, nhưng nếu cascade thì không cần

        // 5. Load lại UserInformation để trả về DTO (có thể lấy từ userAccount)
        UserInformation updatedUserInfo = userInfo; // đã được cập nhật

        return userMapper.toUserReadDTO(updatedUserInfo);
    }


    // --- Other methods (findUserDTOById, findUserEntityById, findAllUsers, deleteUser, isValidEmail) ---
    @Transactional(readOnly = true)
    public UserReadDTO findUserDTOById(long id) {
        UserInformation user = userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));
        return userMapper.toUserReadDTO(user);
    }

    @Transactional(readOnly = true)
    public UserInformation findUserEntityById(long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<UserReadDTO> findAllUsers() {
        List<UserInformation> users = userRepo.findAll();
        return userMapper.toUserReadDTOList(users);
    }

    @Transactional
    public void deleteUser(Long userId) {
        UserInformation user = findUserEntityById(userId);
        logger.warn("Attempting to delete user ID: {}.", userId);
        userRepo.delete(user);
        logger.info("Successfully deleted user with ID: {}", userId);
    }

    private boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }


    public ClientProfile findClientById(Long client_id) {
        return clientRepo.findById(client_id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found with ID: " + client_id));
    }
    public CarwashProfile findCarWashById(Long carwash_id) {
    	return carwashRepo.findById(carwash_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carwash not found with ID: " + carwash_id));

    }

	public long countClient() {
		return clientRepo.count();

	}

	public long countCarwash() {
		return carwashRepo.count();
	}
	
	//tao mot user ao voi email va pass
	public UserCreateDTO generateUserCreateDTOWithEmail(String mail, String pass,String role,String phonenumber) {
		
		UserCreateDTO newUser = new UserCreateDTO();
		newUser.setUsername(phonenumber);
		newUser.setPassword(pass);
		newUser.setEmail(mail);
		newUser.setRole(UserRole.valueOf(role.toUpperCase()));
		newUser.setPhonenumber(phonenumber);
		return newUser;
	}
	
	public String generateUsername() {
		    int randomNum = (int)(Math.random() * 100000); // số ngẫu nhiên 0–99999
		    return "user_" + randomNum;
		}
	
    public void createVerificationTokenAndSendEmail(String mail,String pass,String role,String phonenumber) throws Exception {
    	if (!EMAIL_PATTERN.matcher(mail).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (userRepo.existsByEmail(mail)) {
            throw new IllegalArgumentException("Email already in use");
        }
        String userDataJson;

//        // Tạo token UUID
//        String token = UUID.randomUUID().toString();
//
//
        // Chuyển UserCreateDTO thành JSON
        if(pass != null && role != null) {
        	userDataJson = objectMapper.writeValueAsString(generateUserCreateDTOWithEmail(mail, pass, role,phonenumber));      	
        }
        else {
        	userDataJson = objectMapper.writeValueAsString(mail);
        }
  
//        // Lưu token và JSON userData vào DB
//        VerificationToken verificationToken = new VerificationToken();
//        verificationToken.setToken(token);
//        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
//        verificationToken.setUserDataJson(userDataJson);
//        verificationTokenRepository.save(verificationToken);
        	VerificationOTP verificationOTP = new VerificationOTP();
        	verificationOTP.setOTP(OTPGenerator.generateOTP());
        	verificationOTP.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        	verificationOTP.setUserDataJson(userDataJson);
        	verificationOTP.setUsed(false);
        	verificationOTP.setType(OTPType.REGISTER);
        	verificationOTPRepository.save(verificationOTP);
        	
        	
        // Tạo link xác minh
        String Body = "You OTP: " + verificationOTP.getOTP();

        // Gửi email xác minh
        String subject = "Please confirm your account registration at WashGo";
        mailService.sendMailToUser(mail, subject, "Click the link to verify: " + Body);

    }
    
  
//    @Transactional
//    public boolean verifyUser(String token) {
//        VerificationToken verificationToken = verificationTokenRepository.findByToken(token);
//        System.out.println("'"+verificationToken.getToken() +"'");
//
//        if (verificationToken == null) {
//            logger.warn("Token không tồn tại: {}", token);
//            return false;
//        }
//
//        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
//            logger.warn("Token đã hết hạn: {}", token);
//            verificationTokenRepository.delete(verificationToken);
//            return false;
//        }
//
//        try {
//            // Lấy JSON dữ liệu user
//            String userDataJson = verificationToken.getUserDataJson();
//
//            // Chuyển JSON thành UserCreateDTO
//            UserCreateDTO userCreateDTO = objectMapper.readValue(userDataJson, UserCreateDTO.class);
//
//            // Tạo user thật trong DB
//            registerUser(userCreateDTO);
//
//            // Xóa token sau khi dùng
//            verificationTokenRepository.delete(verificationToken);
//
//            logger.info("Xác minh tài khoản thành công cho email: {}", userCreateDTO.getEmail());
//            return true;
//
//        } catch (Exception e) {
//            logger.error("Lỗi khi xác minh user với token {}: {}", token, e.getMessage());
//            return false;
//        }
//    }

    @Transactional
    public boolean verifyRegisterOTP(String OTP) {
        VerificationOTP verificationOTP = verificationOTPRepository.findByOTP(OTP);

        if (verificationOTP == null || verificationOTP.getType() != OTPType.REGISTER) {
            logger.warn("Invalid OTP for registration: {}", OTP);
            return false;
        }

        if (verificationOTP.getExpiryDate().isBefore(LocalDateTime.now())) {
            logger.warn("OTP has expired for registration: {}", OTP);
            verificationOTPRepository.delete(verificationOTP);
            return false;
        }

        try {
            UserCreateDTO userCreateDTO = objectMapper.readValue(
                verificationOTP.getUserDataJson(),
                UserCreateDTO.class
            );
            registerUser(userCreateDTO);
            verificationOTPRepository.delete(verificationOTP);
            logger.info("Account successfully created for email: {}", userCreateDTO.getEmail());
            return true;
        } catch (Exception e) {
            logger.error("Error while creating account: {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    public boolean verifyForgotPasswordOTP(String OTP) {
        VerificationOTP verificationOTP = verificationOTPRepository.findByOTP(OTP);

        if (verificationOTP == null || verificationOTP.getType() != OTPType.FORGOT_PASSWORD) {
            logger.warn("Invalid OTP for password reset: {}", OTP);
            return false;
        }

        if (verificationOTP.getExpiryDate().isBefore(LocalDateTime.now())) {
            logger.warn("OTP has expired for password reset: {}", OTP);
            verificationOTPRepository.delete(verificationOTP);
            return false;
        }
        
        verificationOTPRepository.delete(verificationOTP);
        updateUserEmailStatus(verificationOTP.getEmail(), emailStatus.ACTIVE);
        logger.info("Valid OTP for password reset. Password change is allowed.");
        return true;
    }


	public UserInformation createUserInformationByPhoneNumber(String phoneNumber) {
		

		if (!PHONE_PATTERN.matcher(phoneNumber).matches()) {
		    throw new IllegalArgumentException("phoneNumber is not valid");
		}

		UserInformation userInformation = new UserInformation();
		userInformation.setPhoneNumber(phoneNumber);
		userInformation.setCreatedAt(LocalDateTime.now());
		userInformation.setUpdatedAt(LocalDateTime.now());
		userInformation.setRole(UserRole.CLIENT);
			return userRepo.save(userInformation);
	}

	public UserInformation findById(Long clientId) {
	    return userRepo.findById(clientId)
	            .orElseThrow(() -> new EntityNotFoundException("UserInformation not found with id: " + clientId));
	}

	public boolean existsByPhoneNumber(String phoneNumber) {
		return userRepo.existsByPhoneNumber(phoneNumber);
	}

	public UserInformation findByPhoneNumber(String phoneNumber) {
	    return userRepo.findByPhoneNumber(phoneNumber)
	                   .orElse(null);  // nếu không tìm thấy trả về null
	}

	public String forgotPasswordByEmail(String email) {
		if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (!(userRepo.existsByEmail(email))) {
            throw new IllegalArgumentException("Email is not exits");
        }
        if(verificationOTPRepository.existsByEmail(email)) {
        	otpService.deleteByEmail(email);
        }
    	VerificationOTP verificationOTP = new VerificationOTP();
    	verificationOTP.setEmail(email);
    	verificationOTP.setOTP(OTPGenerator.generateOTP());
    	verificationOTP.setExpiryDate(LocalDateTime.now().plusMinutes(1));
    	verificationOTP.setUsed(false);
    	verificationOTP.setType(OTPType.FORGOT_PASSWORD);
    	verificationOTPRepository.save(verificationOTP);
    	
    	
    	 // Tạo link xác minh
        String Body = "You OTP: " + verificationOTP.getOTP();

        // Gửi email xác minh
        String subject = "Please confirm your account registration at WashGo";
        
        //thay doi status
        updateUserEmailStatus(email,emailStatus.UPDATE);
        
        try {
        	System.out.println("otp cua ban la :"+verificationOTP.getOTP());
        	return verificationOTP.getOTP();
//			mailService.sendMailToUser(email, subject, "Click the link to verify: " + Body);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        return verificationOTP.getOTP();
	
	}

	public void updateUserEmailStatus(String email, emailStatus update) {

		  UserEmail userEmail = userEmailRepository.findByUserMail(email);
		    userEmail.setEmailStatus(emailStatus.UPDATE);
		    userEmailRepository.save(userEmail);
	}

	public ResponseEntity<?> updateUserPassword(String email, String newPassword) {
	    if (verificationOTPRepository.existsByEmail(email)) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                .body("OTP has not been verified or still exists.");
	    }
	    if(!(userEmailRepository.existsByUserEmailAndEmailStatus(email, emailStatus.UPDATE))) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                .body("You dont have permission to update password");	
	    }

	    UserInformation userInfo = findByEmail(email);

	    if (userInfo == null) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body("User not found.");
	    }

	    UserAccount userAccount = userInfo.getAccount();

	    if (userAccount == null) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                .body("User has not created an account yet.");
	    }

	    // Update password
	    userAccount.setPasswordHash(passwordEncoder.encode(newPassword));
	    userAccountRepository.save(userAccount);

	    return ResponseEntity.ok("Password updated successfully.");
	}

	public UserInformation findByEmail(String email) {
	    Optional<UserInformation> optionalUserInfo = userRepo.findByEmail(email);
	    return optionalUserInfo.orElse(null);
	}






}