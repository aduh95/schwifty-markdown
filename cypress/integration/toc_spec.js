describe("Test HTML rendering", function() {
  it("Tests the TOC generation", function() {
    cy.request("/md/" + encodeURIComponent(Cypress.env("testDir") + "/toc.md"));
    cy.visit("/")
      .then(() => cy.get("#toc"))
      .then($toc => {
        const toc = $toc[0];
        cy.wrap(toc.firstElementChild.nodeName.toLowerCase()).should(
          "eq",
          "details"
        );

        const select = toc.firstElementChild.lastElementChild;
        const list = select.previousElementSibling;
        const listChildren = list.children;
        cy.wrap(list.nodeName.toLowerCase()).should("eq", "ol");

        // Main list should contain 3 items (Because doc has 3 h1 below the nav)
        cy.wrap(listChildren.length).should("eq", 3);

        cy.wrap(listChildren.item(0).lastElementChild.children.length).should(
          "eq",
          1
        );
        cy.wrap(listChildren.item(1).lastElementChild.children.length).should(
          "eq",
          3
        );
        cy.wrap(listChildren.item(2).lastElementChild.children.length).should(
          "eq",
          0
        );

        return cy
          .wrap(listChildren.item(1).lastElementChild.lastElementChild)
          .find("a")
          .last()
          .invoke("attr", "href");
      })
      .then(id => {
        cy.get(id)
          .next()
          .should("have.class", "tag");
      });
  });

  it("Tests the TOC deeepest level option", function() {
    cy.request(
      "/" +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/toc_deepest_level.md")
    );
    cy.visit("/")
      .then(() => cy.get("#toc"))
      .then($toc => {
        const toc = $toc[0];
        cy.wrap(toc.firstElementChild.nodeName.toLowerCase()).should(
          "eq",
          "details"
        );

        const select = toc.firstElementChild.lastElementChild;
        cy.wrap(select.nodeName.toLowerCase()).should("eq", "select");

        const list = select.previousElementSibling;
        const listChildren = list.children;
        cy.wrap(list.nodeName.toLowerCase()).should("eq", "ol");

        // Main list should contain 3 items (Because doc has 3 h1 below the nav)
        cy.wrap(listChildren.length).should("eq", 3);
        cy.wrap(listChildren).each($item => {
          cy.wrap($item)
            .children()
            // .last()
            // .children()
            .its("length")
            .should("eq", 1);
        });
      });
  });

  it("Tests the i18n", function() {
    cy.request(
      "/md/" + encodeURIComponent(Cypress.env("testDir") + "/toc_i18n.md")
    );
    cy.visit("/").then(() =>
      cy
        .get("#toc")
        .children("details")
        .children("summary")
        .invoke("text")
        .should("eq", decodeURIComponent("%D9%81%D9%87%D8%B1%D8%B3"))
    );
  });
});
