import * as actions_exec from "@actions/exec";
import * as core from "@actions/core";
import * as im from "@actions/exec/lib/interfaces";
import fs from "fs";
import path from "path";

/**
 * Execute a command and wrap the output in a log group.
 *
 * @param   commandLine     command to execute (can include additional args). Must be correctly escaped.
 * @param   args            optional arguments for tool. Escaping is handled by the lib.
 * @param   options         optional exec options.  See ExecOptions
 * @param   log_message     log group title.
 * @returns Promise<number> exit code
 */
export async function exec(
	commandLine: string,
	args?: string[],
	options?: im.ExecOptions,
	log_message?: string
): Promise<number> {
	const argsAsString = (args || []).join(" ");
	const message = log_message || `Invoking "${commandLine} ${argsAsString}"`;
	return core.group(message, () => {
		return actions_exec.exec(commandLine, args, options);
	});
}

export function getRequiredRosDistributions(): string[] {
	let requiredRosDistributionsList: string[] = [];
	const requiredRosDistributions = core.getInput("required-ros-distributions");
	if (requiredRosDistributions) {
		requiredRosDistributionsList = requiredRosDistributions.split(
			RegExp("\\s")
		);
	}

	if (!validateDistro(requiredRosDistributionsList)) {
		throw new Error("Input has invalid distribution names.");
	}

	return requiredRosDistributionsList;
}

//list of valid linux distributions
const validDistro: string[] = [
	"kinetic",
	"lunar",
	"melodic",
	"noetic",
	"dashing",
	"eloquent",
	"foxy",
	"galactic",
	"rolling",
];

//Determine whether all inputs name supported ROS distributions.
export function validateDistro(
	requiredRosDistributionsList: string[]
): boolean {
	for (const rosDistro of requiredRosDistributionsList) {
		if (validDistro.indexOf(rosDistro) <= -1) {
			return false;
		}
	}

	return true;
}

/**
 * Check for existence of a given file path.
 *
 * @param   filePath         relative path to the file being inspected.
 * @returns Promise<boolean> true if file exists.
 */
export async function checkFileExists(filePath: string): Promise<boolean> {
	return new Promise((resolve) => {
		fs.access(filePath, fs.constants.F_OK, (error) => {
			resolve(!error);
		});
	});
}

/**
 * Return an array of subdirectories with respect to a provided directory.
 *
 * @param   dir              relative path to the directory being inspected.
 * @returns Promise<Array>   array of subdirectory names.
 */
export async function getSubDirs(dir: string): Promise<Array<string>> {
	const dirents: fs.Dirent[] = await fs.promises.readdir(dir, {
		withFileTypes: true,
	});
	const subdirs = await Promise.all(
		dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name);
			return res;
		})
	);
	return Array.prototype.concat(...subdirs);
}
