#!/usr/bin/env node

import { program } from "commander";
import {
  handleCreateDataSource,
  handleGetDataSource,
  handleDeleteDataSource,
  handleListAllDataSources,
} from "./modules/index.js";

// CREATE DATASOURCE
program
  .command("create <name>")
  .description("Create a new DataSource")
  .action((name) => {
    if (!name) {
      console.error("DataSource name is required");
      process.exit(1);
    }
    handleCreateDataSource(name);
  });

// GET DATASOURCE
program
  .command("get <id>")
  .description("Get a DataSource by ID")
  .action((id) => {
    if (!id) {
      console.error("DataSource ID is required");
      process.exit(1);
    }
    handleGetDataSource(id);
  });

// DELETE DATASOURCE
program
  .command("delete <id>")
  .description("Delete a DataSource")
  .action((id) => {
    if (!id) {
      console.error("DataSource ID is required");
      process.exit(1);
    }
    handleDeleteDataSource(id);
  });

// LIST ALL DATASOURCES
program
  .command("list")
  .description("List all DataSources")
  .action(() => {
    handleListAllDataSources();
  });

program.parse(process.argv);

if (!program.args.length) {
  console.error("No command specified");
  program.outputHelp();
  process.exit(1);
}
