package com.cse3310.library_backend.reservation;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController 
@RequestMapping("/reservation")
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService)
    {
        this.reservationService = reservationService;
    }

    @PostMapping("/add")
    public ReservationResponse makeReservation(@RequestBody ReservationRequest request, Authentication auth)
    {
        return reservationService.makeReservation(request, auth);
    }
}
