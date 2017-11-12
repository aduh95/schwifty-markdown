describe("Test HTML rendering", function() {
  it("Visits the empty file", function() {
    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/empty.md")
    );
    cy.visit(Cypress.env("host"));

    cy.title().should("eq", "empty.md");
    cy
      .document()
      .its("body")
      .invoke("text")
      .should("eq", "");
  });

  it("Try clicking on some links", function() {
    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/links.md")
    );
    cy.visit(Cypress.env("host"));

    cy.get("a[title='local-absolute']").each($link => {
      cy.location("origin").should("eq", $link.prop("origin"));
    });

    cy.get("a[title='global-absolute']").each($link => {
      cy.location("origin").should("not.eq", $link.prop("origin"));
    });

    cy.get("a[title='global-protocol-relative']").each($link => {
      cy.location("origin").should("not.eq", $link.prop("origin"));
    });

    cy
      .get("a[title='dead-link']")
      .click()
      .then($link => {
        cy.wait(2000).then(() => {
          expect($link.css("cursor")).to.be.eq("not-allowed");
        });
      });

    cy
      .get("a[title='local-relative']")
      .click()
      .then($link => {
        cy.wait(5000).then(() => {
          cy.title().should("eq", "empty.md");
        });
      });
  });

  it("Visits the exemple md file", function() {
    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/example.md")
    );
    cy.visit(Cypress.env("host"));
    cy.title().should("eq", "example.md");

    cy
      .get("h1")
      .its("length")
      .should("eq", 1);

    cy
      .get("h2")
      .its("length")
      .should("eq", 1);

    cy
      .get("h3")
      .its("length")
      .should("eq", 1);

    cy
      .get("h4")
      .its("length")
      .should("eq", 1);

    cy
      .get("h5")
      .its("length")
      .should("eq", 1);

    cy
      .get("h6")
      .its("length")
      .should("eq", 1);

    cy
      .get("table>thead")
      .children()
      .children()
      .its("length")
      .should("eq", 2);
    cy
      .get("table>tbody")
      .children()
      .its("length")
      .should("eq", 2);
  });
});
