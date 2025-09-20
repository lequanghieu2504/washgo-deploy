package com.example.washgo.controller;

import com.example.washgo.dtos.BookingRequestDTO;
import com.example.washgo.dtos.CarwashFilterListDTO;
import com.example.washgo.dtos.CarwashFilterMapDTO;
import com.example.washgo.dtos.CarwashProfileFilterCriticcal;
import com.example.washgo.dtos.TimeRequestDTO;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.service.FilterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/filter")
@RequiredArgsConstructor
@Slf4j
public class FilterController {

    private final FilterService filterService;

    
    @GetMapping()
    public ResponseEntity<?> filterCarwashes(@ModelAttribute CarwashProfileFilterCriticcal criteria) {
        List<CarwashFilterListDTO> result = filterService.filterCarwashes(criteria);
        return ResponseEntity.ok(result);
    }

    
    @PostMapping("/timeforcarwashlist")
    public ResponseEntity<?> getListFiltered(@RequestBody TimeRequestDTO request) {
        if (request == null) {
            log.warn("Request body is missing for /api/filter/list");
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Request body is required"));
        }

        if (request.getTime() == null) {
            log.warn("Missing 'time' in request body: {}", request);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Time is required"));
        }

        try {
            List<CarwashFilterListDTO> list = filterService.findActiveCarwashesByUserTime(request.getTime());

            if (list.isEmpty()) {
                log.info("No active carwashes found at {}", request.getTime());
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Unexpected error in /api/filter/list", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Internal server error"));
        }
    }

    @PostMapping("/timeforcarwashmap")
    public ResponseEntity<?> getMapFiltered(@RequestBody TimeRequestDTO request) {
        if (request == null) {
            log.warn("Request body is missing for /api/filter/map");
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Request body is required"));
        }

        if (request.getTime() == null) {
            log.warn("Missing 'time' in request body: {}", request);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Time is required"));
        }

        try {
            List<CarwashFilterMapDTO> mapList = filterService.getCarwashesForMap(request.getTime());

            if (mapList.isEmpty()) {
                log.info("No active carwashes for map at {}", request.getTime());
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(mapList);
        } catch (Exception e) {
            log.error("Unexpected error in /api/filter/map", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Internal server error"));
        }
    }
}