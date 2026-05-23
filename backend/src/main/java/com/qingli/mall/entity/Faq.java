package com.qingli.mall.entity;

public class Faq {
    private Long id;
    private String question;
    private String questionZh;
    private String questionEs;
    private String answer;
    private String answerZh;
    private String answerEs;
    private Integer sortOrder;
    private Integer published;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getQuestionZh() { return questionZh; }
    public void setQuestionZh(String questionZh) { this.questionZh = questionZh; }
    public String getQuestionEs() { return questionEs; }
    public void setQuestionEs(String questionEs) { this.questionEs = questionEs; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getAnswerZh() { return answerZh; }
    public void setAnswerZh(String answerZh) { this.answerZh = answerZh; }
    public String getAnswerEs() { return answerEs; }
    public void setAnswerEs(String answerEs) { this.answerEs = answerEs; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Integer getPublished() { return published; }
    public void setPublished(Integer published) { this.published = published; }
}
