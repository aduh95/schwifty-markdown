describe("Test SVG generation", function() {
  it("Test chart creation", function() {
    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/charts.md")
    );
    cy
      .visit(Cypress.env("host"))
      .then(() => cy.wait(500))
      .then(() => {
        let $img = cy.get("img");
        $img.each($img => {
          cy
            .wrap($img)
            .invoke("prop", "hidden")
            .should("eq", true);

          cy
            .wrap($img.next())
            .invoke("is", "svg")
            .should("eq", true);

          cy
            .wrap($img.next())
            .invoke("find", ".ct-series")
            .its("length")
            .should("gt", 0);
        });
        //   $svg.its("length").should("eq", 3);
      });
  });

  it("Tests yUML rendering", function() {
    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/yuml.md")
    );
    cy
      .visit(Cypress.env("host"))
      .then(() => cy.get("img").invoke("attr", "src"))
      .then(src => cy.request(Cypress.env("host") + src.substring(1)))
      .then(response => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.body, "text/xml");

        cy.wrap(xmlDoc.rootElement.nodeName).should("eq", "svg");
      });
  });
});
