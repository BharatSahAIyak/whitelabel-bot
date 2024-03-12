describe("Verify OTP Page", () => {
  beforeEach("Verify the user is able to redirect on login page", () => {
    cy.visit("http://localhost:3000/login");
    cy.get(".MuiButton-label").click();
    cy.get(".chakra-numberinput__field").type("8928295005");
    cy.get(".login_submitButton__od8IW").click();
  });

  it("VOTC-1 Verify by entering mobile no and click on continue redirect to enter OTP page ", () => {
    cy.url().should("contain", "/otp");
  });

  it("VOTC-2 Verify should be able to see BOT tittle on OTP verification page. ", () => {
    cy.get(".OTP_title__YYg3l")
      .should("contain", "Bot")
      .should("exist")
      .should("be.visible");
  });

  it("VOTC-3 Verify should be able to see 'OTP Verification' text.", () => {
    cy.get(".OTP_otpVerify__aSawW")
      .should("contain", "OTP Verification")
      .should("exist")
      .should("be.visible");
  });

  it("VOTC-3 Verify should be able to see 'We will send you a one time password on this Mobile Number' text and mobile no.", () => {
    cy.get(".OTP_otpSent__Mp3UN")
      .should("contain", "We will send you a one time password on this")
      .should("contain", "Mobile Number")
      .should("exist")
      .should("be.visible");
    cy.contains("+91-8928295005").should("exist");
  });
});
