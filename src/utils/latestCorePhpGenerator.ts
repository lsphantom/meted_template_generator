import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { LessonConfig, LessonPage } from '../types/lesson';

export class LatestCorePhpGenerator {
  private config: LessonConfig;
  private templatePath = '/src/utils/templates/latest_core_php';

  constructor(config: LessonConfig) {
    this.config = config;
  }

  async generateLesson(): Promise<void> {
    try {
      const zip = new JSZip();
      
      // Process template files and copy assets
      await this.processTemplateFiles(zip);
      
      // Generate unit-specific print files
      this.generateUnitPrintFiles(zip);
      
      // Generate and download the ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const filename = `${this.config.lessonTitle?.replace(/[^a-z0-9]/gi, '_') || 'lesson'}_latest_core_php.zip`;
      saveAs(blob, filename);
      
    } catch (error) {
      console.error('Error generating lesson package:', error);
      throw error;
    }
  }

  private async processTemplateFiles(zip: JSZip): Promise<void> {
    // List of template files to process (with variable substitution)
    const templateFiles = [
      'index.htm',
      'navmenu.php',
      'download.php',
      'media_gallery.php',
      'print_sample.php',
      'pageTemplate.php',
      'navmenu.inc.php',
      'navmenu.inc_es.php',
      'navmenu.inc_fr.php'
    ];

    // Process each template file
    for (const filename of templateFiles) {
      try {
        const response = await fetch(`${this.templatePath}/${filename}`);
        if (response.ok) {
          let content = await response.text();
          content = this.processTemplateVariables(content);
          zip.file(filename, content);
        }
      } catch (error) {
        console.warn(`Could not process template file: ${filename}`, error);
      }
    }

    // Copy static files without processing
    const staticFiles = [
      'simple_html_dom.php'
    ];

    for (const filename of staticFiles) {
      try {
        const response = await fetch(`${this.templatePath}/${filename}`);
        if (response.ok) {
          const content = await response.text();
          zip.file(filename, content);
        }
      } catch (error) {
        console.warn(`Could not copy static file: ${filename}`, error);
      }
    }

    // Copy entire asset directories
    await this.copyAssetDirectories(zip);
  }

  private async copyAssetDirectories(zip: JSZip): Promise<void> {
    const assetDirectories = [
      'assets',
      'bootstrap',
      'css',
      'ie-support',
      'jquery',
      'modernizr'
    ];

    for (const dir of assetDirectories) {
      await this.copyDirectory(zip, dir, `${this.templatePath}/${dir}`);
    }
  }

  private async copyDirectory(zip: JSZip, targetDir: string, sourceDir: string): Promise<void> {
    // This is a simplified version - in a real implementation you'd need to
    // recursively fetch all files from the directory structure
    // For now, we'll include the key files manually
    
    if (targetDir === 'bootstrap') {
      await this.copyFile(zip, 'bootstrap/css/bootstrap.min.css', `${sourceDir}/css/bootstrap.min.css`);
      await this.copyFile(zip, 'bootstrap/js/bootstrap.min.js', `${sourceDir}/js/bootstrap.min.js`);
    } else if (targetDir === 'css') {
      await this.copyFile(zip, 'css/meted-base.min.css', `${sourceDir}/meted-base.min.css`);
      await this.copyFile(zip, 'css/module-custom.css', `${sourceDir}/module-custom.css`);
      await this.copyFile(zip, 'css/module-print.css', `${sourceDir}/module-print.css`);
    } else if (targetDir === 'jquery') {
      await this.copyFile(zip, 'jquery/jquery.min.js', `${sourceDir}/jquery.min.js`);
      await this.copyFile(zip, 'jquery/jquery-ui.min.js', `${sourceDir}/jquery-ui.min.js`);
      await this.copyFile(zip, 'jquery/jquery-ui.min.css', `${sourceDir}/jquery-ui.min.css`);
      await this.copyFile(zip, 'jquery/jquery-plugins.min.js', `${sourceDir}/jquery-plugins.min.js`);
      await this.copyFile(zip, 'jquery/apps/apps.css', `${sourceDir}/apps/apps.css`);
      await this.copyFile(zip, 'jquery/apps/apps.js', `${sourceDir}/apps/apps.js`);
    } else if (targetDir === 'modernizr') {
      await this.copyFile(zip, 'modernizr/modernizr.min.js', `${sourceDir}/modernizr.min.js`);
    } else if (targetDir === 'ie-support') {
      await this.copyFile(zip, 'ie-support/html5shiv.js', `${sourceDir}/html5shiv.js`);
      await this.copyFile(zip, 'ie-support/respond.js', `${sourceDir}/respond.js`);
      await this.copyFile(zip, 'ie-support/ie-support.css', `${sourceDir}/ie-support.css`);
    }
  }

  private async copyFile(zip: JSZip, targetPath: string, sourcePath: string): Promise<void> {
    try {
      const response = await fetch(sourcePath);
      if (response.ok) {
        if (targetPath.endsWith('.css') || targetPath.endsWith('.js') || targetPath.endsWith('.php')) {
          const content = await response.text();
          zip.file(targetPath, content);
        } else {
          const content = await response.blob();
          zip.file(targetPath, content);
        }
      }
    } catch (error) {
      console.warn(`Could not copy file: ${targetPath}`, error);
    }
  }

  private generateUnitPrintFiles(zip: JSZip): void {
    const pages = this.config.pages || [];
    
    pages.forEach((page, index) => {
      const unitNumber = index + 1;
      const filename = `print_${unitNumber}.php`;
      const content = this.generateUnitPrintContent(page, unitNumber);
      zip.file(filename, content);
    });
  }

  private generateUnitPrintContent(page: LessonPage, unitNumber: number): string {
    const templateVariables = this.getTemplateVariables();
    
    return `<?php
require_once( 'cometAPI.inc.php' );
$mm = new MediaItemManager();
?>
<!doctype html>
<html lang="${this.getLangCode()}">
<head>
    <title>${templateVariables.lessonTitle}</title>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type">
    <meta name="author" content="UCAR/COMET">
    <meta name="dcterms.rightsHolder" content="UCAR/COMET">
    <meta name="robots" content="all">
    <meta name="Description" content="${templateVariables.lessonDesc}">
    <meta name="keywords" content="${templateVariables.lessonKeys}">
    <meta name="viewport" content="width=device-width">
    <meta name="viewport" content="initial-scale=1.0">
<!-- =CORE TAGS START= -->
    <link rel="stylesheet" type="text/css" media="screen" href="bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" media="screen" href="jquery/jquery-ui.min.css">
    <link rel="stylesheet" type="text/css" media="screen" href="css/meted-base.min.css">
    <script src="jquery/jquery.min.js"></script>
    <script src="jquery/jquery-ui.min.js"></script>
    <script src="jquery/jquery-plugins.min.js"></script>
    <script src="bootstrap/js/bootstrap.min.js"></script>
    <script src="modernizr/modernizr.min.js"></script>
    <link rel="stylesheet" type="text/css" media="print" href="css/module-print.css">
    <script src="jquery/defaults.js"></script>
<!-- =CORE TAGS END= -->
    <script>
    var printVersion = true;
    </script>
    <!--[if lte IE 9]><script type="text/javascript" src="jquery/apps/draw/excanvas.js"></script><script type="text/javascript" src="ie-support/respond.js"></script><link rel="stylesheet" type="text/css" media="screen" href="ie-support/ie-support.css" /><![endif]-->
</head>

<body>
    <!-- MODULE WRAPPER (container) ==================================-->
    <main id="module-wrapper" class="container">
        <div class="row">
            <header id="module-topbanner">
                <a id="module-title" class="module-title-text" href="index.htm">${page.title}</a>
                <h3 id="module-credit" class="hidden-sm hidden-xs">
                    ${this.getProducedByText()}
                </h3>
            </header>
        </div>

        <div class="row">
            <!-- TABLE OF CONTENTS ==================================-->
            <nav id="tableofcontents" class="sidebar-toc">
                <ul class="nav lc-docs-sidenav">
                    <li><a href="#page_${unitNumber}-0-0">${page.title}</a></li>
                    <li><a href="#page_contributors">Contributors</a></li>
                </ul>
            </nav>

            <!-- MODULE CONTENT ==================================-->
            <div id="module-content" class="col-md-9">
                <div class="row unit-header"></div>
                <section id="page_${unitNumber}-0-0" class="page">
                    <h3>${page.title}</h3>
                    
                    <!-- Unit content will be added here by the content management system -->
                    <div class="unit-content-placeholder">
                        <div class="alert alert-info">
                            <h4>Content Placeholder</h4>
                            <p>This unit is ready for content to be added through your content management system.</p>
                            <p><strong>Unit:</strong> ${page.title}</p>
                        </div>
                    </div>
                </section>
                
                <section id="page_contributors" class="page">
                    <h3>Contributors</h3>
                    <p>Content contributors and acknowledgments will be listed here.</p>
                </section>
            </div>
            <!-- END MODULE CONTENT ==============================-->
        </div>

    <!-- MODULE FOOTER ==================================-->
    <footer id="module-footer" class="row">
        <div class="col-md-10 col-sm-12">
            <p class="footer-text">&copy; ${templateVariables.copyrightYear}, <a href="https://www.ucar.edu/">The University Corporation for Atmospheric Research</a><br>${this.getAllRightsReservedText()} <a href="${this.getLegalNoticesUrl()}">${this.getLegalNoticesText()}</a></p>
        </div>
        <div class="col-md-2 hidden-sm hidden-xs">
            <ul class="footer-links list-unstyled">
                <li><a href="https://www.meted.ucar.edu/"><span class="glyphicon glyphicon-link"></span>MetEd</a></li>
                <li><a href="https://comet.ucar.edu"><span class="glyphicon glyphicon-link"></span>COMET</a></li>
            </ul>
        </div>
    </footer>
    <!-- END MODULE FOOTER ==================================-->

    </main>
    <!-- END MODULE WRAPPER (container) ==================================-->

    <!-- BACK TO TOP BUTTON =========================== -->
    <p class="back-top">
        <a href="#top"><span class="glyphicon glyphicon-upload"></span>${this.getBackToTopText()}</a>
    </p>

    <!-- MODAL PROMPTS ======================== -->
    <div id="quiz-prompt"></div>

    <!-- PRINT STYLES SCRIPT ==========================-->
    <script>
    $(document).ready(function() {
        // Remove all media stylesheets
        $('link[media~="screen"]').remove();
        // Convert print stylesheet to all-media
        $('link[media~="print"]').attr('media', 'all');
    });
    </script>
</body>
</html>`;
  }

  private processTemplateVariables(content: string): string {
    const variables = this.getTemplateVariables();
    
    let processedContent = content;

    // Replace all EJS-style template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`<%=\\s*${key}\\s*%>`, 'g');
      processedContent = processedContent.replace(regex, String(value));
    });

    // Handle conditional blocks for language
    processedContent = this.processLanguageConditionals(processedContent);
    
    // Handle conditional blocks for template type
    processedContent = this.processTemplateTypeConditionals(processedContent);

    return processedContent;
  }

  private processLanguageConditionals(content: string): string {
    const lang = this.config.language || 'EN';
    
    // Process Spanish conditionals
    content = content.replace(
      /<% if \(lessonLang === 'ES'\) \{ %>[\s\S]*?<% } else if \(lessonLang === 'FR'\) \{ %>[\s\S]*?<% } else \{ %>[\s\S]*?<% } %>/g,
      (_, esContent, frContent, enContent) => {
        switch (lang) {
          case 'ES': return esContent.trim();
          case 'FR': return frContent.trim();
          default: return enContent.trim();
        }
      }
    );

    // Process simpler conditionals
    content = content.replace(
      /<% if \(lessonLang==='ES' \) \{ %>[\s\S]*?<% } else if \(lessonLang==='FR' \) \{ %>[\s\S]*?<% } else \{ %>[\s\S]*?<% } %>/g,
      (_, esContent, frContent, enContent) => {
        switch (lang) {
          case 'ES': return esContent.trim();
          case 'FR': return frContent.trim();
          default: return enContent.trim();
        }
      }
    );

    return content;
  }

  private processTemplateTypeConditionals(content: string): string {
    content = content.replace(
      /<% if \(templateType==='multi-print' \|\| templateType==='articulate-shell' \) \{ %>([\s\S]*?)<% } %>/g,
      (_, conditionalContent) => {
        return conditionalContent.trim();
      }
    );

    content = content.replace(
      /<% if \(templateType==='articulate-shell' \) \{ %>([\s\S]*?)<% } else \{ %>([\s\S]*?)<% } %>/g,
      (_, _articulateContent, regularContent) => {
        return regularContent.trim();
      }
    );

    return content;
  }

  private getTemplateVariables(): Record<string, string | number> {
    const currentYear = new Date().getFullYear();
    
    return {
      lessonTitle: this.config.lessonTitle || 'Untitled Lesson',
      lessonDesc: this.config.description || 'MetEd lesson created with the lesson generator',
      lessonKeys: this.config.keywords || 'meteorology, education, training',
      lessonID: this.config.lessonId || 0,
      lessonPath: '/', // Default path
      copyrightYear: currentYear,
      splashImageCredit: '',
      lessonLang: this.config.language || 'EN',
      templateType: 'multi-print'
    };
  }

  private getLangCode(): string {
    switch (this.config.language) {
      case 'ES': return 'es';
      case 'FR': return 'fr';
      default: return 'en';
    }
  }

  private getProducedByText(): string {
    switch (this.config.language) {
      case 'ES': return 'Producido por The COMET® Program';
      case 'FR': return 'Produit par le programme COMET®';
      default: return 'Produced by The COMET&reg; Program';
    }
  }

  private getAllRightsReservedText(): string {
    switch (this.config.language) {
      case 'ES': return 'Reservados todos los derechos.';
      case 'FR': return 'Tous droits réservés.';
      default: return 'All Rights Reserved.';
    }
  }

  private getLegalNoticesText(): string {
    switch (this.config.language) {
      case 'ES': return 'Avisos legales';
      case 'FR': return 'Mentions juridiques';
      default: return 'Legal notices';
    }
  }

  private getLegalNoticesUrl(): string {
    switch (this.config.language) {
      case 'ES': return 'https://meted.ucar.edu/legal_es.htm';
      case 'FR': return 'https://meted.ucar.edu/legal.htm';
      default: return 'https://meted.ucar.edu/legal.htm';
    }
  }

  private getBackToTopText(): string {
    switch (this.config.language) {
      case 'ES': return 'Arriba';
      case 'FR': return 'Haut de la page';
      default: return 'Back to Top';
    }
  }
}