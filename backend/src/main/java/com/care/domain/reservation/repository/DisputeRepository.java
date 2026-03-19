package com.care.domain.reservation.repository;

import com.care.domain.reservation.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DisputeRepository extends JpaRepository<Dispute, String> {

    Optional<Dispute> findByDisputeId(String disputeId);
    Optional<Dispute> findByReservation_ReservationId(String reservationId);
    Optional<Dispute> findByDisputeIdAndReservation_ReservationId(String disputeId, String reservationId);
    boolean existsByTargetScratch_LogIdAndStatusNot(String logId, String status);

}
