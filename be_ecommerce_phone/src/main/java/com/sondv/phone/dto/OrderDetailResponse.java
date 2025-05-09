package com.sondv.phone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private int quantity;
    private BigDecimal price;
    private ReviewResponse review;
}
