const path =require('path')
const memFs =require('mem-fs')
const fs = require('fs-extra')
const editor =require('mem-fs-editor')

module.exports=class Creator {
  constructor (options) {
    const store = memFs.create()
    this.fs = editor.create(store)
    this.init()
  }

  init () {}

  templatePath (...args) {
    let filepath = path.join.apply(path, args)
    if (!path.isAbsolute(filepath)) {
      filepath = path.join(this.conf.libDir, 'templates', filepath)
    }
    return filepath
  }

  destinationPath (...args){
    let filepath = path.join.apply(path, args)
    if (!path.isAbsolute(filepath)) {
      filepath = path.join(this.conf.projectDir, filepath)
    }
    return filepath
  }

  appPath (...args){
    let filepath = path.join.apply(path, args)
    if (!path.isAbsolute(filepath)) {
      filepath = path.join(this.conf.projectDir, this.conf.src, 'app.json')
    }
    return filepath
  }

  template (source, dest, data, options) {
      if (typeof dest !== 'string') {
          options = data
          data = dest
          dest = source
        }
    this.fs.copyTpl(
      this.templatePath(source),
      this.destinationPath(dest),
      Object.assign({}, this.conf, data),
      options
    )
    return this
  }

  writeTemplate(){}

  async writeSubpackages(subPageName, pageName='pages'){
    const appJson = await fs.readJson(this.appPath())

    if(!appJson.subpackages)appJson.subpackages=[]
    const subpackages = appJson.subpackages
    const pageSubPacksIndex = subpackages.findIndex(item=>item.root===pageName)
    if(pageSubPacksIndex>=0){
      const page = appJson.subpackages[pageSubPacksIndex].pages

      page.includes(`${subPageName}/index`) || 
      appJson.subpackages[pageSubPacksIndex].pages.push(`${subPageName}/index`)
    }else{
      appJson.subpackages.push({
        root:pageName,
        pages:[`${subPageName}/index`]
      })
    }
    await fs.writeJSON(this.appPath(), appJson)
  }

  async writePagepackages(subPageName){
    const appJson = await fs.readJson(this.appPath())
    if(!appJson.pages)appJson.pages = []
    const pagePath = `pages/${subPageName}/index`
    if(!appJson.pages.includes(pagePath))appJson.pages.push(pagePath)
    await fs.writeJSON(this.appPath(), appJson)
  }

  async removeSubpackages(subPageName, pageName, isAll=false){
    const appJson = await fs.readJson(this.appPath())

    const subpackages = appJson.subpackages
    const pageSubPacksIndex = subpackages.findIndex(item=>item.root===pageName)
    if(pageSubPacksIndex<0)return
    if(isAll)appJson.subpackages.splice(pageSubPacksIndex,1)
    else {
      const pages = appJson.subpackages[pageSubPacksIndex].pages
      const pageIndex = pages.findIndex(page=>page.includes(`${subPageName}/index`))
      if(pageIndex>=0)pages.splice(pageIndex,1)
    }
    
    await fs.writeJSON(this.appPath(), appJson)
  }

  async removePagePackages(subPageName){
    const appJson = await fs.readJson(this.appPath())

    if(!subPageName)delete appJson.pages
    else {
      const index = appJson.pages.findIndex(item=>item.includes(`${subPageName}/index`))
      if(index < 0)return
      appJson.pages.splice(index,1)
    }

    await fs.writeJSON(this.appPath(), appJson)
  }
}
