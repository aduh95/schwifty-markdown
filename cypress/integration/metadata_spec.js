describe("Test metadata insertion", function() {
  it("Visits the markdown file containing metadata", function() {
    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/metadata.md")
    );
    cy.visit(Cypress.env("host"));

    cy.title().should("eq", "Title test: éàø-~\\ n");

    cy
      .document()
      .its("head")
      .children("meta[name='author']")
      .invoke("attr", "value")
      .should("eq", "Cypress \\o/ Test");
    cy
      .document()
      .its("head")
      .children("meta[name='keywords']")
      .invoke("attr", "value")
      .should("eq", "test,schwifty,cypress");
    cy
      .document()
      .its("head")
      .children("meta[name='description']")
      .invoke("attr", "value")
      .should(
        "eq",
        "This file set a lot of metadata which should be inserted into HTML by Schwifty."
      );
  });
});
