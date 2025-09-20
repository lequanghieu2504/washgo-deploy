package com.example.washgo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration class for setting up WebSocket with STOMP messaging.
 */
@Configuration
@EnableWebSocketMessageBroker // Enables WebSocket message handling, backed by a message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Registers STOMP endpoints mapped to specific URLs and configures SockJS fallback options.
     * Clients will connect to these endpoints to establish a WebSocket connection.
     * @param registry The registry for STOMP endpoints.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register "/ws" as the WebSocket endpoint.
        // withSockJS() provides fallback options for browsers that don't support WebSocket.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    /**
     * Configures the message broker which will be used to route messages from one client to another.
     * @param registry The registry for the message broker.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Define the application destination prefix. Messages sent from clients to destinations
        // starting with "/app" will be routed to @MessageMapping annotated methods in controllers.
        // For example, a message to "/app/chat" might be handled by a controller method mapped to "/chat".
        registry.setApplicationDestinationPrefixes("/app");

        // Enable a simple in-memory message broker.
        // Messages will be routed to clients subscribed to destinations starting with "/topic" or "/queue".
        // "/topic" is typically used for publish-subscribe (one-to-many) communication.
        // "/queue" is typically used for point-to-point (one-to-one) messaging.
        registry.enableSimpleBroker("/topic", "/queue");

        // Optionally, configure the prefix for user-specific destinations.
        // If you want to send messages directly to a specific user, you might configure this.
        // For example, sending to "/user/{username}/queue/private"
        // registry.setUserDestinationPrefix("/user");
    }
}
