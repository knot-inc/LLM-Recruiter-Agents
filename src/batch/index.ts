export async function runBatch(
  totalJobs: number,
  batchSize: number,
  runTask: (taskId: number) => Promise<void>,
  callback?: (batchId: number) => Promise<void>,
) {
  const tasks = Array.from({ length: totalJobs }, (_, index) => index + 1);

  let batchCount = 0;
  while (tasks.length > 0) {
    const batch = tasks.splice(0, batchSize);
    const batchPromises = batch.map((taskId) => runTask(taskId - 1));

    await Promise.all(batchPromises);

    if (callback) {
      await callback(batchCount);
    }

    batchCount++;
    console.log(`Finished batch ${batchCount}`);
    await new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log("waited for 60 sec after batch");
        resolve(true);
      }, 60000);
    });
  }
}
