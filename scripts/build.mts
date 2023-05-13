import esbuild, { BuildOptions } from "esbuild";
import nodemon from "nodemon";
import { parseArgs } from "util";
import { nodeExternalsPlugin } from "esbuild-node-externals";


const buildConfig: BuildOptions = {
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "esnext",
  tsconfig: "tsconfig.json",
  loader: { ".ts": "ts" },
  plugins: [nodeExternalsPlugin()],
};

const { values: args } = parseArgs({
  options: {
    watch: {
      type: "boolean",
      short: "w",
    },
    dev: {
      type: "boolean",
      short: "d",
    },
  },
});

const buildFn = async () =>
  await esbuild
    .build(buildConfig)
    .then(() => console.log("======== ⚡ Build Done! ========"))
    .catch(console.error);

const watchFn = async () =>{
  const ctx = await esbuild.context(buildConfig);
  await ctx.watch();
  console.log("======== 👀 Watch Mode Enabled ========");
}

const execute = async () => {
  if (args.watch || args.dev) {
    await watchFn();
  } else {
    await buildFn();
  };

  if (args.dev) {
    nodemon({
      script: "dist/index.js",
      ext: "js",
      runOnChangeOnly: true, // prevent run twice if script file not exist
    });

    nodemon
      .on("start", () => {
        console.log("======== 🚦 Nodemon started ========");
      })
      .on("quit", () => {
        console.log("======== 👋 Nodemon quit ========");
        process.exit();
      })
      .on("restart", (files) => {
        console.log("======== 🔨 Nodemon Restarted ========");
      });
  }
};

await execute()

