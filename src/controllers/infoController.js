class InfoController {
  getInfo = async (req, res) => {
    const info = {
      inputArgs: process.argv.slice(2).join(' '),
      platform: process.env.OS,
      nodeVersion: process.version,
      rss: process.memoryUsage().rss,
      executionPath: process.argv[1],
      processId: process.pid,
      projectFolder: process.cwd(),
    };
    res.render("info", {info});
  };
}

export default InfoController;
