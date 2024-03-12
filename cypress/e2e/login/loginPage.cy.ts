describe("Login Page", () => {
  beforeEach("Verify the user is able to redirect on login page", () => {
    cy.visit("http://localhost:3000/login");
  });

  it("LTC-1 Verify should be able to see /login end-point in url", () => {
    cy.url().should("contain", "/login");
  });

  it("LTC-2 Verify should be able to get install app popup on login screen and should be able to install", () => {
    cy.get(".MuiButton-label")
      .should("exist")
      .should("have.text", "Install")
      .click();
  });

  it("LTC-3 Verify should be able see Bot tittle on login page", () => {
    cy.get(".MuiButton-label").click();
    cy.get(".login_title__4vzwt")
      .should("exist")
      .should("contain", "Bot")
      .should("be.visible");
    cy.get('[style="flex: 1 1 0%; text-align: center;"]')
      .should("exist")
      .should("contain", "Bot")
      .should("be.visible");
  });

  it("LTC-4 Verify should be able see language toggle", () => {
    cy.get(".MuiButton-label").click();
    cy.get('[style="display: flex; align-items: center;"]')
      .should("exist")
      .should("be.visible");
    cy.get("#hindi").click();
    cy.get("#eng").click();
  });

  it("LTC-5 Verify should be able see logo(img) on login page", () => {
    cy.get(".MuiButton-label").click();
    cy.get(
      'div[style="min-width: 200px; display: flex; justify-content: space-between;"]'
    )
      .children("img")
      .each(($img) => {
        cy.wrap($img).should(
          "have.attr",
          "src",
          "https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
        );
      });
  });

  it("LTC-6 Verify should be able see mobile no input box and continue button.", () => {
    cy.get(".MuiButton-label").click();
    cy.get(".chakra-numberinput__field").should("exist").should("be.visible");
    cy.get('input[placeholder="Enter Mobile Number"]').should("exist");
    cy.get(".login_submitButton__od8IW").should("contain", "Continue");
  });

  it("LTC-7 Verify should be able enter 10 digit mobile no in input field.", () => {
    cy.get(".MuiButton-label").click();
    cy.get(".chakra-numberinput__field")
      .type("8928295005")
      .should("have.value", "8928295005");
  });

  it("LTC-8 Verify should not be able enter more than 10 digit mobile no in input field.", () => {
    cy.get(".MuiButton-label").click();
    cy.get(".chakra-numberinput__field")
      .type("8928295005123")
      .should("have.value", "8928295005");
  });

  it("LTC-9 Verify mobile number field should accept only the numeric value by entering alphabets.", () => {
    cy.get(".MuiButton-label").click();
    cy.get(".chakra-numberinput__field").type("abcd").should("have.value", "");
  });

  it("LTC-10 Verify by entering the less number than the actual mobile number ", () => {
    cy.get(".MuiButton-label").click();
    cy.get(".chakra-numberinput__field").type("892829500");
    cy.get(".login_submitButton__od8IW").click();
    cy.get("div[role='status']").should("contain", "Enter a 10 digit number!");
  });
});
