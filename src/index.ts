
async function main(): Promise<void> {
  await new Promise(resolve => resolve(true));
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
