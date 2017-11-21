describe("Test chart generation", function() {
  it("Test SVG creation", function() {
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
});
