package com.example.washgo.dtos;

import lombok.Data;

@Data
public class MailRequest {
	 private String to;       // địa chỉ email người nhận
	    private String subject;  // tiêu đề
	    private String content;  // nội dung
}
