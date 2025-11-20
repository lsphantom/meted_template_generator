// Types based on the original Yeoman generator structure

export interface LessonConfig {
  // Basic lesson information
  language: string
  lessonTitle: string
  lessonId: string
  metedPath: string
  description: string
  objectives: string
  keywords: string
  
  // Publication details
  pubMonth: string
  pubYear: string
  version: string
  publicationDate: string
  lastModified: string
  templateTheme: string
  customCopyrightYear?: string
  customCoverImageCredit?: string
  
  // Technical settings
  templateType: 'latest_core_legacy_standard' | 'latest_core_legacy_articulate' | 'latest_core_lms_agnostic'
  useBootstrap: boolean
  customCSS?: string
  
  // Feature flags
  includeQuiz: boolean
  includeGlossary: boolean
  includeReferences: boolean
  includeResources: boolean
  includeNarratedTextSwitch: boolean
  includeAdditionalTopLevelPages: boolean
  includeContributorsPage: boolean
  includeReferencesPage: boolean
  includeResourcesPage: boolean
  includeCustomPage: boolean
  customPageTitle?: string
  includePreassessment: boolean
  includeSurvey: boolean
  includeContributors: boolean
  enablePrintableVersion: boolean
  enableProgressTracking: boolean
  enableAccessibility: boolean
  enableMobileOptimization: boolean
  
  // Content pages
  pages: LessonPage[]
}

export interface LessonPage {
  id: string
  title: string
  content: string
  order: number
  type: 'content' | 'quiz' | 'preassessment' | 'survey' | 'resources'
}

export interface AssetFile {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  file: File
  path: string
}

export interface GeneratedLesson {
  config: LessonConfig
  assets: AssetFile[]
  generatedFiles: GeneratedFile[]
}

export interface GeneratedFile {
  path: string
  content: string
  type: 'html' | 'php' | 'css' | 'js' | 'json'
}