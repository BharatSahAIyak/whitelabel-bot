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
  });
});
