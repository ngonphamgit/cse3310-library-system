package com.cse3310.library_backend.reservation;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
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

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @PostMapping("/add")
    public ReservationResponse makeReservation(@RequestBody MakeReservationRequest request, Authentication auth)
    {
        return reservationService.makeReservation(request, auth);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @PostMapping ("/fulfill")
    public FulfillReservationResponse fulfillReservation(@RequestBody FulfillReservationRequest request, Authentication auth)
    {
        return reservationService.fulfillReservation(request, auth);
    }
}
