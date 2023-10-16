export async function runBatch(
  totalJobs: number,
  batchSize: number,
  runTask: (taskId: number) => Promise<void>,
) {
  const tasks = Array.from({ length: totalJobs }, (_, index) => index + 1);

  while (tasks.length > 0) {
    const batch = tasks.splice(0, batchSize);
    const batchPromises = batch.map((taskId) => runTask(taskId));

    await Promise.all(batchPromises).then(() => {
      setTimeout(() => {
        console.log("waiting for 3 seconds");
      }, 3000);
    });
  }
}
