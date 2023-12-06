const GLPK = require('glpk.js');
const glpk = GLPK();

export function findBinaryMatrix(n, K, W) {
    let lp = {
        name: 'BinaryMatrix',
        objective: {
            direction: glpk.GLP_MAX,
            name: 'obj',
            vars: []
        },
        subjectTo: [],
        binaries: []
    };

    // Define variables
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= n; j++) {
            let name = `x${i}${j}`;
            // lp.objective.vars.push({ name: name, coef: 1 });
            lp.objective.vars.push({ name: name, coef: W[i-1][j-1] });
            lp.binaries.push(name);
        }
    }

    // Add constraints to prevent self-connections (diagonal elements set to 0)
    for (let i = 1; i <= n; i++) {
      let name = `x${i}${i}`;
      lp.subjectTo.push({
          name: `diag${i}`,
          vars: [{ name: name, coef: 1 }],
          bnds: { type: glpk.GLP_FX, ub: 0, lb: 0 } // Fixing diagonal elements to 0
      });
    }

    // Add constraints for each row and column
    for (let i = 1; i <= n; i++) {
        // Row constraint
        let rowConstraint = {
            name: `row${i}`,
            vars: [],
            bnds: { type: glpk.GLP_FX, ub: K, lb: K }
        };
        for (let j = 1; j <= n; j++) {
            rowConstraint.vars.push({ name: `x${i}${j}`, coef: 1 });
        }
        lp.subjectTo.push(rowConstraint);

        // Column constraint
        let colConstraint = {
            name: `col${i}`,
            vars: [],
            bnds: { type: glpk.GLP_FX, ub: K, lb: K }
        };
        for (let j = 1; j <= n; j++) {
            colConstraint.vars.push({ name: `x${j}${i}`, coef: 1 });
        }
        lp.subjectTo.push(colConstraint);
    }

    const options = {
        msglev: glpk.GLP_MSG_ALL,
        presol: true
    };

    // Solve the problem
    const res = glpk.solve(lp, options);
    let matrix = [];

    if (res.result.status === glpk.GLP_OPT || res.result.status === glpk.GLP_FEAS) {
        for (let i = 1; i <= n; i++) {
            let row = [];
            for (let j = 1; j <= n; j++) {
                row.push(res.result.vars[`x${i}${j}`]);
            }
            matrix.push(row);
        }
    } else {
        console.log("No feasible solution found");
        return null;
    }

    return matrix;
}

