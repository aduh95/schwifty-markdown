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
        cy.wait(500).then(() => {
          expect($link.css("cursor")).to.be.eq("not-allowed");
        });
      });

    cy
      .get("a[title='local-relative']")
      .click()
      .then($link => {
        cy.title().should("eq", "empty.md");
      });
  });
});
