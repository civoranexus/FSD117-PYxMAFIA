async function warmup(req, res) {
  return res.status(200).json({
    ok: true,
    message: "hi from Piyush's backend!",
    now: new Date().toISOString(),
  });
}

const warmupController = { warmup };
export default warmupController;
