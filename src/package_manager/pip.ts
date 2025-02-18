import * as utils from "../utils";
import path from "path";

const pip3Packages: string[] = [
	"argcomplete",
	"colcon-bash==0.4.2",
	"colcon-cd==0.1.1",
	"colcon-cmake==0.2.26",
	"colcon-common-extensions==0.2.1",
	"colcon-core==0.6.1",
	"colcon-coveragepy-result==0.0.8",
	"colcon-defaults==0.2.5",
	"colcon-lcov-result==0.5.0",
	"colcon-library-path==0.2.1",
	"colcon-metadata==0.2.5",
	"colcon-mixin==0.2.0",
	"colcon-notification==0.2.13",
	"colcon-output==0.2.12",
	"colcon-package-information==0.3.3",
	"colcon-package-selection==0.2.10",
	"colcon-parallel-executor==0.2.4",
	"colcon-pkg-config==0.1.0",
	"colcon-powershell==0.3.6",
	"colcon-python-setup-py==0.2.7",
	"colcon-recursive-crawl==0.2.1",
	"colcon-ros==0.3.21",
	"colcon-test-result==0.3.8",
	"coverage",
	"cryptography",
	"empy",
	"flake8<3.8",
	"flake8-blind-except",
	"flake8-builtins",
	"flake8-class-newline",
	"flake8-comprehensions",
	"flake8-deprecated",
	"flake8-docstrings",
	"flake8-import-order",
	"flake8-quotes",
	"ifcfg",
	"importlib-metadata==2.*",
	"importlib-resources",
	"lark-parser",
	"mock",
	"mypy",
	"nose",
	"numpy==1.18.0",
	"pep8",
	"pydocstyle",
	"pyparsing",
	"pytest",
	"pytest-cov",
	"pytest-mock",
	"pytest-repeat",
	"pytest-rerunfailures",
	"pytest-runner",
	"setuptools",
	"wheel",
];

const pipInstallPrefix: string = ".pip_install_dir";
const pipInstallPath = path.join(process.cwd(), pipInstallPrefix);
const pip3CommandLine: string[] = ["pip3", "install", "--upgrade"];

/**
 * Run Python3 pip install on a list of specified packages.
 *
 * @param   packages        list of pip packages to be installed
 * @param   run_with_sudo   whether to prefix the command with sudo
 * @returns Promise<number> exit code
 */
export async function runPython3PipInstall(
	packages: string[],
	run_with_sudo?: boolean
): Promise<number> {
	const sudo_enabled = run_with_sudo === undefined ? true : run_with_sudo;
	let args = pip3CommandLine.concat(packages);
	args = args.concat(["--prefix", pipInstallPath]);
	if (sudo_enabled) {
		return utils.exec("sudo", args);
	} else {
		return utils.exec(args[0], args.splice(1));
	}
}

/**
 * Run Python3 pip install on a list of specified packages.
 *
 * @param   run_with_sudo   whether to prefix the command with sudo
 * @returns Promise<number> exit code
 */
export async function installPython3Dependencies(
	run_with_sudo?: boolean
): Promise<number> {
	return runPython3PipInstall(pip3Packages, run_with_sudo);
}

export async function addPipDirToPath() {
	const pip_subdirs = utils.getSubDirs(path.join(pipInstallPath, "lib"));
	let path_separator;
	if (process.platform === "win32") {
		path_separator = ";";
	} else {
		path_separator = ":";
	}
	pip_subdirs?.then(function (subdirs) {
		subdirs?.forEach(async (subdir) => {
			if (process.env.PATH) {
				console.log("HERE");
				console.log(
					"PATH=$PATH".concat(
						path_separator,
						path.join(pipInstallPath, "lib", subdir)
					)
				);
				if (process.platform === "win32") {
					console.log("ok");
				} else {
					utils.exec("sudo", [
						"export",
						"PATH=$PATH".concat(
							path_separator,
							path.join(pipInstallPath, "lib", subdir)
						),
					]);
				}
				process.env.PATH = process.env.PATH.concat(
					path_separator,
					path.join(pipInstallPath, "lib", subdir)
				);
			} else {
				console.log("THERE");
				process.env.PATH = path.join(pipInstallPath, "lib", subdir);
			}
		});
	});
}
