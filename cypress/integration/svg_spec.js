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
        cy.get("img").each($img => {
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

  it("Tests diagram rendering", function() {
    const checkSVGReception = response => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.body, "text/xml");

      cy.wrap(xmlDoc.rootElement.nodeName).should("eq", "svg");
    };

    cy.request(
      Cypress.env("host") +
        "md/" +
        encodeURIComponent(Cypress.env("testDir") + "/yuml.md")
    );
    cy.visit(Cypress.env("host")).then(() => {
      cy
        .get("img")
        .each(img => {
          const src = img.attr("src");
          if (src.startsWith("data:text/mermaid")) {
            // Mermaid diagram case
            cy
              .wrap(img.parent())
              .get("img.lang-mermaid")
              .invoke("attr", "src");
            /** @see https://github.com/cypress-io/cypress/issues/1688 */
            // .then(url => cy.request({ url }))
            // .then(checkSVGReception);
          } else {
            cy.request(src).then(checkSVGReception);
          }
        })
        .its("length")
        .should("eq", 5);
    });
  });
});
