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

  it("Testing adding JS and CSS file in the metadata", function() {
    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/metadata.md")
    );
    cy.visit(Cypress.env("host"));

    cy
      .document()
      .its("head")
      .children("script[src$='empty.mjs'][type='module']")
      .its("length")
      .should("eq", 1);

    cy
      .document()
      .its("head")
      .children("script[src='ftp://127.0.0.4/will_fail.js']")
      .its("length")
      .should("eq", 1);

    cy
      .document()
      .its("head")
      .children("script[src='//code.jquery.com/jquery.js']")
      .its("length")
      .should("eq", 1);

    cy
      .document()
      .its("head")
      .children("link[href='//code.jquery.com/jquery.css']")
      .its("length")
      .should("eq", 1);
    cy
      .document()
      .its("head")
      .children("link[href='ftp://127.0.0.4/will_fail.css']")
      .its("length")
      .should("eq", 1);

    cy
      .window()
      .invoke("hasOwnProperty", "cypressTest")
      .should("eq", true);
    cy
      .window()
      .its("cypressTest")
      .should("eq", "someValue");

    cy
      .window()
      .invoke("hasOwnProperty", "ESModuleTest")
      .should("eq", true);
    cy
      .window()
      .its("ESModuleTest")
      .should("eq", "someValue");
  });
});
