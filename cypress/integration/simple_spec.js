describe("Test HTML rendering", function() {
  it("Visits the empty file", function() {
    cy.request(
      "/md/" + encodeURIComponent(Cypress.env("testDir") + "/empty.md")
    );
    cy.visit("/");

    cy.title().should("eq", "empty.md");
    cy.document()
      .its("body")
      .invoke("text")
      .should("eq", "");
  });

  it("Try clicking on some links", function() {
    cy.request(
      "/md/" + encodeURIComponent(Cypress.env("testDir") + "/links.md")
    );
    cy.visit("/");

    cy.get("a[title='local-absolute']").each($link => {
      cy.location("origin").should("eq", $link.prop("origin"));
    });

    cy.get("a[title='global-absolute']").each($link => {
      cy.location("origin").should("not.eq", $link.prop("origin"));
    });

    cy.get("a[title='global-protocol-relative']").each($link => {
      cy.location("origin").should("not.eq", $link.prop("origin"));
    });

    cy.get("a[title='dead-link']")
      .click()
      .then($link => {
        cy.wait(500).then(() => {
          expect($link.css("cursor")).to.be.eq("not-allowed");
        });
      });

    cy.get("a[title='local-relative']")
      .click()
      .then($link => {
        cy.title().should("eq", "empty.md");
      });

    cy.go("back").then(() => cy.title().should("eq", "links.md"));
    cy.get("a[title='local-relative-parent']>:first")
      .click()
      .then($link => {
        cy.title().should("eq", "empty.md");
      });

    cy.go("back").then(() => cy.title().should("eq", "links.md"));
    cy.get("a[title='local-relative-with-hash']:first").then($link => {
      cy.wrap($link.prop("hash")).should("eq", "#test");
    });

    cy.get("a[title='protocol-relative-with-hash']:first").then($link => {
      cy.location("origin").should("not.eq", $link.prop("origin"));
      cy.wrap($link.prop("hash")).should("eq", "#test");
    });

    cy.get("a[title='local-with-hash']:first")
      .click()
      .then($link => {
        cy.title().should("eq", "links.md");
        cy.hash().should("eq", "#test");
      });
  });
});
