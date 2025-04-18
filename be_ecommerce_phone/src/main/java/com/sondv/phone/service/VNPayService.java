package com.sondv.phone.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Value("${VNPAY_TMN_CODE}")
    private String vnp_TmnCode;

    @Value("${VNPAY_HASH_SECRET}")
    private String vnp_HashSecret;

    @Value("${VNPAY_PAY_URL}")
    private String vnp_PayUrl;

    @Value("${VNPAY_RETURN_URL}")
    private String vnp_ReturnUrl;

    private static final Logger log = LoggerFactory.getLogger(VNPayService.class);

    public String createVNPayPayment(Long paymentId, double amount) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_TxnRef = String.valueOf(paymentId);
            String vnp_OrderInfo = "Thanh toan don hang: " + paymentId;
            String vnp_IpAddr = "127.0.0.1";
            String vnp_OrderType = "billpayment";

            if (amount <= 0) {
                log.error("Invalid amount: {}", amount);
                throw new IllegalArgumentException("Số tiền không hợp lệ: " + amount);
            }

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf((long) (amount * 100)));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", vnp_OrderType);
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = df.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (String fieldName : fieldNames) {
                String value = vnp_Params.get(fieldName);
                if (value != null && !value.isEmpty()) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8)).append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                    if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                        hashData.append('&');
                        query.append('&');
                    }
                }
            }

            String secureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
            query.append("&vnp_SecureHash=").append(secureHash);

            String paymentUrl = vnp_PayUrl + "?" + query.toString();
            log.info("VNPay params: {}", vnp_Params);
            log.info("Generated VNPay URL: {}", paymentUrl);
            return paymentUrl;
        } catch (Exception e) {
            log.error("Error creating VNPay payment for paymentId {}: {}", paymentId, e.getMessage());
            throw new RuntimeException("Lỗi tạo URL thanh toán VNPay", e);
        }
    }

    // Phương thức mới để tính toán hash cho callback
    public String calculateSecureHash(Map<String, String> params) {
        try {
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            for (String fieldName : fieldNames) {
                String value = params.get(fieldName);
                if (value != null && !value.isEmpty()) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                    if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                        hashData.append('&');
                    }
                }
            }
            return hmacSHA512(vnp_HashSecret, hashData.toString());
        } catch (Exception e) {
            log.error("Error calculating secure hash: {}", e.getMessage());
            throw new RuntimeException("Lỗi tính toán secure hash", e);
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception ex) {
            log.error("Error generating HMAC SHA512: {}", ex.getMessage());
            throw new RuntimeException("Error while generating HMAC SHA512", ex);
        }
    }
}