const inquirer = require("inquirer");
const db = require("./db/connection");

const mainMenu = async () => {
  const { action } = await inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
      "Exit",
    ],
  });

  switch (action) {
    case "View all departments":
      return viewDepartments();
    case "View all roles":
      return viewRoles();
    case "View all employees":
      return viewEmployees();
    case "Add a department":
      return addDepartment();
    case "Add a role":
      return addRole();
    case "Add an employee":
      return addEmployee();
    case "Update an employee role":
      return updateEmployeeRole();
    case "Exit":
      return process.exit();
  }
};

const viewDepartments = async () => {
  const result = await db.query("SELECT * FROM department");
  console.table(result.rows);
  mainMenu();
};

const viewRoles = async () => {
  const result = await db.query("SELECT * FROM role");
  console.table(result.rows);
  mainMenu();
};

const viewEmployees = async () => {
  const result = await db.query("SELECT * FROM employee");
  console.table(result.rows);
  mainMenu();
};

const addDepartment = async () => {
  const { name } = await inquirer.prompt({
    name: "name",
    type: "input",
    message: "Enter the name of the department:",
  });

  await db.query("INSERT INTO department (name) VALUES ($1)", [name]);
  console.log(`Added ${name} to the database`);
  mainMenu();
};

const addRole = async () => {
  const departments = await db.query("SELECT * FROM department");
  const departmentChoices = departments.rows.map((department) => ({
    name: department.name,
    value: department.id,
  }));

  const { title, salary, department_id } = await inquirer.prompt([
    {
      name: "title",
      type: "input",
      message: "Enter the name of the role:",
    },
    {
      name: "salary",
      type: "input",
      message: "Enter the salary of the role:",
    },
    {
      name: "department_id",
      type: "list",
      message: "Select the department for the role:",
      choices: departmentChoices,
    },
  ]);

  await db.query(
    "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
    [title, salary, department_id]
  );

  console.log(`Added ${title} to the database`);
  mainMenu();
};

const addEmployee = async () => {
  const roles = await db.query("SELECT * FROM role");
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const employees = await db.query("SELECT * FROM employee");
  const managerChoices = employees.rows.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      name: "first_name",
      type: "input",
      message: "Enter the employee's first name:",
    },
    {
      name: "last_name",
      type: "input",
      message: "Enter the employee's last name:",
    },
    {
      name: "role_id",
      type: "list",
      message: "Select the employee's role:",
      choices: roleChoices,
    },
    {
      name: "manager_id",
      type: "list",
      message: "Select the employee's manager:",
      choices: [...managerChoices, { name: "None", value: null }],
    },
  ]);

  await db.query(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [first_name, last_name, role_id, manager_id]
  );

  console.log(`Added ${first_name} ${last_name} to the database`);
  mainMenu();
};

const updateEmployeeRole = async () => {
  const employees = await db.query("SELECT * FROM employee");
  const employeeChoices = employees.rows.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const roles = await db.query("SELECT * FROM role");
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const { employee_id, role_id } = await inquirer.prompt([
    {
      name: "employee_id",
      type: "list",
      message: "Select the employee to update:",
      choices: employeeChoices,
    },
    {
      name: "role_id",
      type: "list",
      message: "Select the new role:",
      choices: roleChoices,
    },
  ]);

  await db.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
    role_id,
    employee_id,
  ]);

  console.log("Updated employee role");
  mainMenu();
};

mainMenu();
