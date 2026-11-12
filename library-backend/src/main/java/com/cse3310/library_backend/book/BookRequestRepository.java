package com.cse3310.library_backend.book;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRequestRepository extends JpaRepository<BookRequest, Long>
{
    List<BookRequest> findAll();
}
