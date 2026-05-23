package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.ContactMessage;
import com.qingli.mall.mapper.ContactMessageMapper;
import com.qingli.mall.mapper.MiscMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.util.List;

/**
 * 联系/报价表单接口
 *
 * POST /api/contact/send   提交联系表单（name, email, subject, message）
 * POST /api/contact/quote  提交报价表单（name, email, phone, company, product, quantity, message）
 * GET  /api/contact/messages  获取所有留言（管理端）
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactMessageMapper messageMapper;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    /** 从数据库读取收件邮箱，数据库未配置时降级到 yml 默认值 */
    @Autowired
    private MiscMapper miscMapper;

    @Value("${app.mail.recipient:info@qinglipeptide.com}")
    private String recipientEmailFallback;

    @Value("${app.mail.from-name:Qing Li Peptide Website}")
    private String fromName;

    /** 获取实际收件邮箱：优先读数据库 contact_email，没有则用 yml 配置的默认值 */
    private String getRecipientEmail() {
        String dbEmail = miscMapper.findConfigByKey("contact_email");
        return (dbEmail != null && !dbEmail.trim().isEmpty()) ? dbEmail.trim() : recipientEmailFallback;
    }

    /** ── 联系表单 ─────────────────────────────────────── */
    @PostMapping("/send")
    public ApiResult<Void> sendContact(@Valid @RequestBody ContactRequest req,
                                        HttpServletRequest httpReq) {
        ContactMessage msg = new ContactMessage();
        msg.setFormType("contact");
        msg.setName(req.name);
        msg.setEmail(req.email);
        msg.setSubject(req.subject);
        msg.setMessage(req.message);
        msg.setIpAddress(httpReq.getRemoteAddr());
        messageMapper.insert(msg);

        sendEmail("New Contact Message: " + req.subject,
                buildContactHtml(req.name, req.email, req.subject, req.message));

        return ApiResult.ok(null);
    }

    /** ── 报价表单 ─────────────────────────────────────── */
    @PostMapping("/quote")
    public ApiResult<Void> sendQuote(@Valid @RequestBody QuoteRequest req,
                                      HttpServletRequest httpReq) {
        ContactMessage msg = new ContactMessage();
        msg.setFormType("quote");
        msg.setName(req.name);
        msg.setEmail(req.email);
        msg.setPhone(req.phone);
        msg.setCompany(req.company);
        msg.setProduct(req.product);
        msg.setQuantity(req.quantity);
        msg.setMessage(req.message);
        msg.setIpAddress(httpReq.getRemoteAddr());
        messageMapper.insert(msg);

        sendEmail("New Quote Request: " + req.product,
                buildQuoteHtml(req));

        return ApiResult.ok(null);
    }

    /** ── 管理端：获取所有留言 ──────────────────────────── */
    @GetMapping("/messages")
    public ApiResult<List<ContactMessage>> messages() {
        return ApiResult.ok(messageMapper.findAll());
    }

    /** ── 邮件发送（SMTP 未配置时静默跳过）──────────────── */
    private void sendEmail(String subject, String htmlBody) {
        if (mailSender == null) return;
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setTo(getRecipientEmail());
            helper.setSubject("[" + fromName + "] " + subject);
            helper.setText(htmlBody, true);
            mailSender.send(mime);
        } catch (Exception e) {
            // 邮件失败不影响主流程，仅记录日志
            System.err.println("[Mail Error] " + e.getMessage());
        }
    }

    /** 转义 HTML 特殊字符，防止 XSS 注入 */
    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String buildContactHtml(String name, String email, String subject, String message) {
        return "<h2>New Contact Message</h2>"
                + "<p><b>Name:</b> " + esc(name) + "</p>"
                + "<p><b>Email:</b> " + esc(email) + "</p>"
                + "<p><b>Subject:</b> " + esc(subject) + "</p>"
                + "<p><b>Message:</b></p><p>" + esc(message).replace("\n", "<br>") + "</p>";
    }

    private String buildQuoteHtml(QuoteRequest r) {
        return "<h2>New Quote Request</h2>"
                + "<p><b>Name:</b> " + esc(r.name) + "</p>"
                + "<p><b>Email:</b> " + esc(r.email) + "</p>"
                + "<p><b>Phone:</b> " + esc(r.phone) + "</p>"
                + "<p><b>Company:</b> " + esc(r.company) + "</p>"
                + "<p><b>Product:</b> " + esc(r.product) + "</p>"
                + "<p><b>Quantity:</b> " + esc(r.quantity) + "</p>"
                + "<p><b>Message:</b></p><p>" + esc(r.message).replace("\n", "<br>") + "</p>";
    }

    // ── 内部请求 DTO ────────────────────────────────────────
    public static class ContactRequest {
        @NotBlank public String name;
        @NotBlank @Email public String email;
        public String subject;
        @NotBlank public String message;
    }

    public static class QuoteRequest {
        @NotBlank public String name;
        @NotBlank @Email public String email;
        public String phone;
        public String company;
        public String product;
        public String quantity;
        @NotBlank public String message;
    }
}
