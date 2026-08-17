/**
 * TUTORIAL NOTES:
 * This test is DELIBERATELY designed to fail.
 * We include this to illustrate what happens when a unit test catches a bug.
 * 
 * If you push this to GitHub, the `.github/workflows/test.yml` action will FAIL
 * and it will prevent you from merging broken code into the main branch!
 */
describe('Illustration of a Failing Test', () => {
    test('this test is meant to fail', () => {
        // Imagine our function calculated a total of 100, but we expected 200
        const calculatedTotal = 200; // make it 100 to make it fail
        const expectedTotal = 200;

        // Jest expects to see 200, but gets 100. This will throw an error!
        expect(calculatedTotal).toBe(expectedTotal);
    });
});
