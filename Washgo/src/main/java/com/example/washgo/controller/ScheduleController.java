	package com.example.washgo.controller;
	
	import com.example.washgo.dtos.ScheduleInputDTO;
	import com.example.washgo.model.Schedule;
	import com.example.washgo.util.SecurityUtils;
	import com.example.washgo.service.ScheduleService;
	
	import org.springframework.beans.factory.annotation.Autowired;
	import org.springframework.http.ResponseEntity;
	import org.springframework.security.access.prepost.PreAuthorize;
	import org.springframework.security.core.Authentication;
	import org.springframework.security.core.context.SecurityContextHolder;
	import org.springframework.web.bind.annotation.*;
	
	import java.net.Authenticator;
	import java.util.List;
	
	@RestController
	@RequestMapping("/api/schedules")
	public class ScheduleController {
		   private final ScheduleService scheduleService;
		    private final SecurityUtils securityUtils;

		    @Autowired
		    public ScheduleController(ScheduleService scheduleService, SecurityUtils securityUtils) {
		        this.scheduleService = scheduleService;
		        this.securityUtils = securityUtils;
		    }
	    @PreAuthorize("hasRole('CARWASH')")
	    @PostMapping("/carwash")
	    public ResponseEntity<?> addSchedule(
	            @RequestBody ScheduleInputDTO schedule
	    ) {
	        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	        Long carwashOwnerId = securityUtils.getAuthenticatedUserId(authentication);
	        schedule.setCarwashId(carwashOwnerId);
	        Schedule saved = scheduleService.addSchedule(schedule);
	        return ResponseEntity.ok(saved);
	    }
	
	    // ✅ View all schedules (active products only)
	    @GetMapping("/getAll")
	    public ResponseEntity<List<Schedule>> getAllSchedules() {
	        return ResponseEntity.ok(scheduleService.getAllSchedules());
	    }
	
	    // ✅ Update Schedule
	    @PutMapping("/{scheduleId}")
	    public ResponseEntity<Schedule> updateSchedule(@PathVariable Long scheduleId, @RequestBody Schedule schedule) {
	        return ResponseEntity.ok(scheduleService.updateSchedule(scheduleId, schedule));
	    }
	
	//    // ✅ Delete Schedule
	//    @DeleteMapping("/{scheduleId}")
	//    public ResponseEntity<String> deleteSchedule(@PathVariable Long scheduleId) {
	//        scheduleService.deleteSchedule(scheduleId);
	//        return ResponseEntity.ok("Schedule deleted successfully.");
	//    }
	    
	}
