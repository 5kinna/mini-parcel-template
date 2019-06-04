const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const { exec } = require('child_process')
const ora = require('ora')

module.exports = function (creater, params, helper, cb) {
  const { projectName, projectDir, description, typescript, src, css,appId } = params

  const projectPath = path.join(projectDir, projectName)
  const sourceDir = path.join(projectPath, 'miniprogram',src)

  const template='typescript'

  let appCSSName
  let pageCSSName
  const styleExtMap = {
    sass: 'scss',
    less: 'less',
    stylus: 'styl',
    none: 'css'
  }
  const currentStyleExt = styleExtMap[css] || 'css'

  fs.ensureDirSync(projectPath)
  fs.ensureDirSync(sourceDir)
  fs.ensureDirSync(path.join(sourceDir, 'typings'))

  switch (css) {
    case 'sass':
      appCSSName = 'app.scss'
      pageCSSName = 'index.scss'
      break
    case 'less':
      appCSSName = 'app.less'
      pageCSSName = 'index.less'
      break
    case 'stylus':
      appCSSName = 'app.styl'
      pageCSSName = 'index.styl'
      break
    default:
      appCSSName = 'app.css'
      pageCSSName = 'index.css'
      break
  }

  creater.template(template, 'style',path.join(sourceDir, appCSSName))
  creater.template(template, 'style',path.join(sourceDir, 'pages', 'index', pageCSSName))

  creater.template(template, 'appjs',path.join(sourceDir, 'app.ts'))
  creater.template(template, 'projectjs',path.join(projectPath, 'project.config.json'),{
    projectName,
    appId
  })
  creater.template(template, 'json',path.join(sourceDir, 'app.json'), {
    projectName
  })
  creater.template(template, 'pagejs',path.join(sourceDir, 'pages', 'index', 'index.ts'))
  creater.template(template, 'json',path.join(sourceDir, 'pages', 'index', 'index.json'),{
    projectName
  })
  creater.template(template, 'wxml',path.join(sourceDir, 'pages', 'index', 'index.wxml'))
  creater.template(template, 'packagejson',path.join(projectPath, 'package.json'))
  creater.template(template, 'typings',path.join(projectPath, 'typings'))

  creater.fs.commit(() => {
    const chalkPath=typescript?`${projectName}/miniprogram/${src}`:`${projectName}/${src}`
    console.log()
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建项目: ${chalk.grey.bold(projectName)}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建源码目录: ${chalkPath}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建页面目录: ${chalkPath}/pages`)}`)
    
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建页面 JS 文件: ${chalkPath}/pages/index/index.ts`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建页面 JSON 文件: ${chalkPath}/pages/index/index.json`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建页面 WXML 文件: ${chalkPath}/pages/index/index.wxml`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建页面 ${currentStyleExt.toLocaleUpperCase()} 文件: ${chalkPath}/pages/index/${pageCSSName}`)}`)
    
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建文件: ${chalkPath}/app.ts`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建文件: ${chalkPath}/${appCSSName}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建文件: ${chalkPath}/app.json`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建文件: ${projectName}/project.config.json`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建文件: ${projectName}/package.json`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`创建目录: ${projectName}/typings`)}`)
    
    // install
    const command='npm install'
    const installSpinner = ora(`执行安装项目依赖 ${chalk.cyan.bold(command)}, 需要一会儿...`).start()
    exec(command, (error, stdout, stderr) => {
      if (error) {
        installSpinner.color = 'red'
        installSpinner.fail(chalk.red('安装项目依赖失败，请自行重新安装！'))
        console.log(error)
      } else {
        installSpinner.color = 'green'
        installSpinner.succeed('安装成功')
        console.log(`${stderr}${stdout}`)
      }
      console.log(chalk.green(`创建项目 ${chalk.green.bold(projectName)} 成功！`))
      console.log(chalk.green(`请进入项目目录 ${chalk.green.bold(projectName)} 开始工作吧！😝`))
      if (typeof cb === 'function') {
        cb()
      }
    })
  })
}
