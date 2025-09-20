package com.example.washgo.service;

import com.example.washgo.dtos.CarwashDTO;
import com.example.washgo.dtos.ScheduleInputDTO;
import com.example.washgo.enums.BookingStatus;
import com.example.washgo.mapper.ScheduleMapper;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.Schedule;
import com.example.washgo.repository.ScheduleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class ScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleService.class);
  
    @Autowired
    private  ScheduleMapper scheduleMapper;
    private final ScheduleRepository scheduleRepository;
    private final CarwashService carwashService;
    private final UserInformationService userInformationService;

    public ScheduleService(ScheduleRepository scheduleRepository,
                           CarwashService carwashService,UserInformationService userInformationService) {
        this.scheduleRepository = scheduleRepository;
        this.carwashService = carwashService;
        this.userInformationService = userInformationService;
    }


    @Transactional
    public Schedule addSchedule(ScheduleInputDTO scheduleDTO) {
        // Kiểm tra carwash đã có schedule hay chưa

        scheduleRepository.findByCarwashId(scheduleDTO.getCarwashId()).ifPresent(existing -> {
            throw new IllegalStateException("Carwash (ID: " + scheduleDTO.getCarwashId() + ") đã có schedule rồi.");
        });

        Schedule schedule = scheduleMapper.toSchedule(scheduleDTO);

        // Lưu xuống DB
        Schedule saved = scheduleRepository.save(schedule);

        return saved;
    }

    /**
     * Lấy toàn bộ schedules hiện có (dành cho admin hoặc debug).
     */
    @Transactional(readOnly = true)
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    /**
     * Cập nhật một Schedule (giờ mở/đóng, capacity, isActive) dựa vào scheduleId.
     * Giữ nguyên ràng buộc:
     *  - Nếu đã có booking ở trạng thái ACCEPTED, không cho thay đổi giờ hoặc active.
     *  - Nếu giảm capacity, không được nhỏ hơn số booking active.
     *
     * @param scheduleId ID của Schedule cần cập nhật
     * @param updated    Đối tượng Schedule chứa giá trị mới (availableFrom, availableTo, capacity, isActive có thể truyền vào null)
     * @return Schedule đã được cập nhật
     */
    @Transactional
    public Schedule updateSchedule(Long scheduleId, Schedule updated) {
        Schedule existing = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NoSuchElementException("Schedule không tồn tại: " + scheduleId));

        CarwashProfile carwash = existing.getCarwash();
        if (carwash == null) {
            throw new IllegalStateException("Schedule (ID: " + scheduleId + ") không liên kết với Carwash nào.");
        }

        // --- Đếm số booking đang ACCEPTED ---
//        long activeBookingCount = existing.getBookings().stream()
//                .filter(b -> BookingStatus.ACCEPTED.equals(b.getStatus()))
//                .count();

        // Kiểm tra xem giờ đang thay đổi hay active đang thay đổi
        boolean timeChanging = !existing.getAvailableFrom().equals(updated.getAvailableFrom())
                || !existing.getAvailableTo().equals(updated.getAvailableTo());
        boolean activeChanging = existing.isActive() != updated.isActive();

//        if (activeBookingCount > 0 && (timeChanging || activeChanging)) {
//            throw new IllegalStateException(
//                    "Không thể thay đổi giờ hoặc trạng thái active cho schedule ID " + scheduleId +
//                            " bởi vì có " + activeBookingCount + " booking đã được chấp nhận."
//            );
//        }

        // Validate giờ mới (nếu thay đổi)
        LocalTime newFrom = updated.getAvailableFrom();
        LocalTime newTo   = updated.getAvailableTo();
        if (newFrom == null || newTo == null) {
            throw new IllegalArgumentException("availableFrom và availableTo không được null.");
        }
        if (newFrom.isAfter(newTo) || newFrom.equals(newTo)) {
            throw new IllegalArgumentException("availableFrom phải trước availableTo và không được bằng nhau.");
        }

        // Validate capacity mới
        int newCap = updated.getCapacity();
        if (newCap < 1) {
            throw new IllegalArgumentException("capacity phải >= 1.");
        }

//        // Nếu giảm capacity, không cho giảm xuống dưới số booking active
//        if (newCap < existing.getCapacity() && newCap < activeBookingCount) {
//            throw new IllegalStateException(
//                    "Không thể giảm capacity xuống dưới số booking đang active (" + activeBookingCount + ")."
//            );
//        }

        // Áp dụng giá trị mới
        existing.setAvailableFrom(newFrom);
        existing.setAvailableTo(newTo);
        existing.setCapacity(newCap);

        // Tính lại isActive dựa vào giờ hiện tại
        boolean currentlyOpen = isWithinOperatingHours(newFrom, newTo, LocalTime.now());
        existing.setActive(currentlyOpen);

        Schedule saved = scheduleRepository.save(existing);
        logger.info("Cập nhật schedule ID={}: from={} to={} capacity={} isActive={}",
                scheduleId, newFrom, newTo, newCap, currentlyOpen);
        return saved;
    }

    /**
     * Xóa một Schedule (nếu không còn booking ACCEPTED).
     *
     * @param scheduleId ID của Schedule cần xóa
     */
//    @Transactional
//    public void deleteSchedule(Long scheduleId) {
//        Schedule schedule = scheduleRepository.findById(scheduleId)
//                .orElseThrow(() -> new NoSuchElementException("Schedule không tồn tại: " + scheduleId));
//
//        boolean hasActiveBookings = schedule.getBookings().stream()
//                .anyMatch(b -> BookingStatus.ACCEPTED.equals(b.getStatus()));
//        if (hasActiveBookings) {
//            throw new IllegalStateException(
//                    "Không thể xóa schedule ID " + scheduleId + " vì còn booking đã được chấp nhận."
//            );
//        }
//
//        scheduleRepository.delete(schedule);
//        logger.info("Đã xóa schedule ID={}", scheduleId);
//    }

    /**
     * Tìm một Schedule theo ID (để BookingService hoặc Controller gọi khi cần).
     *
     * @param id ID của Schedule
     * @return Schedule (nếu không tìm thấy, ném EntityNotFoundException)
     */
    @Transactional(readOnly = true)
    public Schedule findScheduledId(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule không tồn tại: " + id));
    }

    /**
     * Cập nhật lại capacity của Schedule (khi booking mới hoặc hủy).
     *
     * @param schedule  Schedule đã được load (thường do BookingService gọi)
     */
    @Transactional
    public void updateScheduleCapacity(Schedule schedule) {
        if (schedule.getCapacity() < 0) {
            throw new IllegalStateException("Schedule capacity không được âm.");
        }
        scheduleRepository.save(schedule);
        logger.info("Cập nhật capacity schedule ID={} thành {}", schedule.getId(), schedule.getCapacity());
    }

    // ---------------------------------------
    // Helper functions
    // ---------------------------------------

    /**
     * Tính toạ độ flag isActive (mở/đóng) dựa vào giờ hiện tại.
     * @param availableFrom Giờ mở cửa
     * @param availableTo   Giờ đóng cửa
     * @param now           Giờ hiện tại
     * @return true nếu now ∈ [availableFrom, availableTo), ngược lại false
     */
    private boolean isWithinOperatingHours(LocalTime availableFrom, LocalTime availableTo, LocalTime now) {
        return !now.isBefore(availableFrom) && now.isBefore(availableTo);
    }
}
