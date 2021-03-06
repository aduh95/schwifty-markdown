describe("Test HTML rendering", function() {
  it("Visits the exemple md file", function() {
    cy.request(
      "/md/" + encodeURIComponent(Cypress.env("testDir") + "/example.md")
    );
    cy.visit("/");
    cy.title().should("eq", "Title of the document");

    cy.get("h1")
      .its("length")
      .should("eq", 2);

    cy.get("h2")
      .its("length")
      .should("eq", 1);

    cy.get("h3")
      .its("length")
      .should("eq", 1);

    cy.get("h4")
      .its("length")
      .should("eq", 1);

    cy.get("h5")
      .its("length")
      .should("eq", 1);

    cy.get("h6")
      .its("length")
      .should("eq", 1);

    cy.get("table>thead")
      .children()
      .children()
      .its("length")
      .should("eq", 2);
    cy.get("table>tbody")
      .children()
      .its("length")
      .should("eq", 2);
  });
});
