package com.cse3310.library_backend.reservation;

import com.cse3310.library_backend.loan.LoanResponse;

public record FulfillReservationResponse(
    LoanResponse loanResponse,
    ReservationResponse reservationResponse
) {
    
}
