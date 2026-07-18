package com.substring.chat.controllers;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.repositories.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomRepository roomRepo;

    public RoomController(RoomRepository roomRepo) {
        this.roomRepo = roomRepo;
    }

    private String normalizeRoomId(String roomId) {
        return roomId == null ? "" : roomId.trim();
    }

    private Map<String, Object> buildRoomResponse(Room room) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", room.getId());
        response.put("roomId", room.getRoomId());
        response.put("messages", room.getMessages());
        return response;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
        String normalizedRoomId = normalizeRoomId(roomId);

        if (normalizedRoomId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Room ID is required"));
        }

        if (roomRepo.findByRoomId(normalizedRoomId) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Room already exists"));
        }

        Room room = new Room();
        room.setRoomId(normalizedRoomId);

        Room savedRoom = roomRepo.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildRoomResponse(savedRoom));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> findRoom(@PathVariable String roomId) {
        String normalizedRoomId = normalizeRoomId(roomId);
        Room room = roomRepo.findByRoomId(normalizedRoomId);

        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Room not found"));
        }
        return ResponseEntity.ok(buildRoomResponse(room));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
    ) {
        String normalizedRoomId = normalizeRoomId(roomId);
        Room room = roomRepo.findByRoomId(normalizedRoomId);
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Message> messages = room.getMessages();
        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);
        List<Message> paginatedMessages = messages.subList(start, end);

        return ResponseEntity.ok(paginatedMessages);
    }
}
