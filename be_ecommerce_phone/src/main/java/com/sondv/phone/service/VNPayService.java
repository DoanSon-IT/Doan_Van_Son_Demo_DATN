package com.sondv.phone.service;

import com.sondv.phone.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.core.env.Environment;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    private final String vnp_TmnCode;
    private final String vnp_HashSecret;
    private final String vnp_PayUrl;
    private final String vnp_ReturnUrl;
    private final String vnp_IpnUrl;
    private final PaymentRepository paymentRepository;
    private final Environment environment;

    private static final Logger log = LoggerFactory.getLogger(VNPayService.class);

    public VNPayService(PaymentRepository paymentRepository,
            Environment environment,
            @Value("${vnpay.tmnCode}") String vnp_TmnCode,
            @Value("${vnpay.hashSecret}") String vnp_HashSecret,
            @Value("${vnpay.payUrl}") String vnp_PayUrl,
            @Value("${vnpay.returnUrl}") String vnp_ReturnUrl,
            @Value("${vnpay.ipnUrl}") String vnp_IpnUrl) {
        this.paymentRepository = paymentRepository;
        this.environment = environment;
        this.vnp_TmnCode = vnp_TmnCode;
        this.vnp_HashSecret = vnp_HashSecret;
        this.vnp_PayUrl = vnp_PayUrl;
        this.vnp_ReturnUrl = vnp_ReturnUrl;
        this.vnp_IpnUrl = vnp_IpnUrl;

        // Log configuration on startup
        log.info("VNPay Configuration - Environment: {}", environment.getActiveProfiles()[0]);
        log.info("VNPay TMN Code: {}", vnp_TmnCode);
        log.info("VNPay Pay URL: {}", vnp_PayUrl);
        log.info("VNPay Return URL: {}", vnp_ReturnUrl);
        log.info("VNPay IPN URL: {}", vnp_IpnUrl);
    }

    /**
     * Tạo URL thanh toán cho VNPay.
     * 
     * @param paymentId ID của thanh toán
     * @param amount    Số tiền thanh toán
     * @return URL thanh toán
     */
    public String createPayment(Long paymentId, double amount) {
        paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với ID: " + paymentId));

        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_TxnRef = String.valueOf(paymentId);
            String vnp_OrderInfo = "Thanh toan don hang: " + paymentId;
            String vnp_OrderType = "billpayment";

            if (amount <= 0) {
                log.error("Invalid amount: {}", amount);
                throw new IllegalArgumentException("Số tiền không hợp lệ: " + amount);
            }

            // Log environment and configuration
            log.info("Creating VNPay payment in environment: {}", environment.getActiveProfiles()[0]);
            log.info("Using VNPay configuration - TMN Code: {}, Return URL: {}, IPN URL: {}",
                    vnp_TmnCode, vnp_ReturnUrl, vnp_IpnUrl);

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
            vnp_Params.put("vnp_IpnUrl", vnp_IpnUrl);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = df.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            // Add expire date (15 minutes from now)
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = df.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Get client IP from request
            String vnp_IpAddr = "127.0.0.1"; // Default to localhost
            try {
                // In a real application, you would get this from the HttpServletRequest
                // For now, we'll use a default value for development
                if (environment.getActiveProfiles()[0].equals("prod")) {
                    // In production, we should get the real IP
                    // vnp_IpAddr = request.getRemoteAddr();
                    log.warn(
                            "Running in production but using default IP. Should be replaced with real IP in production.");
                } else {
                    log.info("Using default IP for development environment");
                }
            } catch (Exception e) {
                log.warn("Could not get client IP, using default: {}", vnp_IpAddr);
            }
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (String fieldName : fieldNames) {
                String value = vnp_Params.get(fieldName);
                if (value != null && !value.isEmpty()) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8)).append('=')
                            .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
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

    /**
     * Xác thực callback từ VNPay.
     * 
     * @param params Các tham số từ callback
     * @return true nếu hợp lệ, false nếu không
     */
    public boolean validateCallback(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
                log.error("Missing vnp_SecureHash in callback params");
                return false;
            }

            Map<String, String> vnpParams = new HashMap<>(params);
            vnpParams.remove("vnp_SecureHash");
            vnpParams.remove("vnp_SecureHashType");

            String calculatedHash = calculateSecureHash(vnpParams);
            boolean isValid = calculatedHash.equals(vnp_SecureHash);

            if (!isValid) {
                log.error("Invalid secure hash. Expected: {}, Received: {}", calculatedHash, vnp_SecureHash);
                log.error("Callback params: {}", params);
            }

            return isValid;
        } catch (Exception e) {
            log.error("Error validating VNPay callback: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Tính toán secure hash cho các tham số VNPay.
     * 
     * @param params Các tham số cần tính hash
     * @return Chuỗi hash
     */
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