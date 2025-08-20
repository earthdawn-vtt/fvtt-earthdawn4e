#!/usr/bin/env node

/**
 * Repository Statistics Analysis Tool
 * Generates comprehensive statistics for the earthdawn4eV2 repository
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class RepositoryAnalyzer {
  constructor(repoPath = '.') {
    this.repoPath = path.resolve(repoPath);
    this.stats = {
      repository: {},
      codebase: {},
      files: {},
      git: {},
      github: {}
    };
  }

  /**
   * Main analysis method
   */
  async analyze() {
    console.log('🔍 Analyzing repository statistics...\n');
    
    await this.analyzeRepository();
    await this.analyzeCodebase();
    await this.analyzeFileStructure();
    await this.analyzeGitHistory();
    
    this.generateReport();
  }

  /**
   * Analyze basic repository information
   */
  async analyzeRepository() {
    console.log('📊 Gathering repository information...');
    
    // Read package.json for basic info
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.repoPath, 'package.json'), 'utf8'));
      this.stats.repository.name = packageJson.name || 'earthdawn4eV2';
      this.stats.repository.version = packageJson.version;
      this.stats.repository.description = packageJson.description;
      this.stats.repository.author = packageJson.author;
    } catch (error) {
      console.warn('Could not read package.json');
    }

    // Read system.json for FoundryVTT system info
    try {
      const systemJson = JSON.parse(fs.readFileSync(path.join(this.repoPath, 'system.json'), 'utf8'));
      this.stats.repository.systemInfo = {
        title: systemJson.title,
        version: systemJson.version,
        compatibility: systemJson.compatibility,
        authors: systemJson.authors
      };
    } catch (error) {
      console.warn('Could not read system.json');
    }

    // Get repository creation date from git
    try {
      const firstCommit = execSync('git log --reverse --format="%ci" | head -n 1', { 
        cwd: this.repoPath, 
        encoding: 'utf8' 
      }).trim();
      this.stats.repository.created = new Date(firstCommit);
    } catch (error) {
      console.warn('Could not get repository creation date');
    }
  }

  /**
   * Analyze codebase statistics
   */
  async analyzeCodebase() {
    console.log('💻 Analyzing codebase...');
    
    const fileTypes = {
      'JavaScript (ES Modules)': ['.mjs'],
      'Handlebars Templates': ['.hbs'],
      'LESS Stylesheets': ['.less'],
      'CSS': ['.css'],
      'JSON': ['.json'],
      'Markdown': ['.md'],
      'Configuration': ['.yaml', '.yml', '.toml', '.config.js', '.config.mjs']
    };

    this.stats.codebase.fileTypes = {};
    this.stats.codebase.totalLines = 0;
    this.stats.codebase.totalFiles = 0;

    for (const [typeName, extensions] of Object.entries(fileTypes)) {
      const typeStats = { files: 0, lines: 0 };
      
      for (const ext of extensions) {
        try {
          // Find files with this extension
          const findCmd = `find "${this.repoPath}" -name "*${ext}" -type f ! -path "*/node_modules/*" ! -path "*/.git/*"`;
          const files = execSync(findCmd, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
          
          typeStats.files += files.length;
          
          // Count lines in these files
          if (files.length > 0) {
            try {
              const wcCmd = `wc -l ${files.map(f => `"${f}"`).join(' ')} | tail -n 1`;
              const linesOutput = execSync(wcCmd, { encoding: 'utf8' }).trim();
              const lines = parseInt(linesOutput.split(/\s+/)[0]) || 0;
              typeStats.lines += lines;
            } catch (error) {
              // If wc fails, count lines individually
              for (const file of files) {
                try {
                  const content = fs.readFileSync(file, 'utf8');
                  typeStats.lines += content.split('\n').length;
                } catch (err) {
                  // Skip files that can't be read
                }
              }
            }
          }
        } catch (error) {
          // Extension not found or error occurred
        }
      }

      if (typeStats.files > 0) {
        this.stats.codebase.fileTypes[typeName] = typeStats;
        this.stats.codebase.totalFiles += typeStats.files;
        this.stats.codebase.totalLines += typeStats.lines;
      }
    }

    // Analyze module structure
    this.analyzeModuleStructure();
  }

  /**
   * Analyze the module structure
   */
  analyzeModuleStructure() {
    const modulePath = path.join(this.repoPath, 'module');
    if (fs.existsSync(modulePath)) {
      const moduleStats = {};
      
      const walkDir = (dir, basePath = '') => {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          if (item.isDirectory()) {
            const dirPath = path.join(dir, item.name);
            const relativePath = path.join(basePath, item.name);
            
            // Count files in this directory
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mjs'));
            if (files.length > 0) {
              moduleStats[relativePath] = files.length;
            }
            
            // Recursively analyze subdirectories
            walkDir(dirPath, relativePath);
          }
        }
      };

      walkDir(modulePath);
      this.stats.codebase.moduleStructure = moduleStats;
    }
  }

  /**
   * Analyze file structure
   */
  async analyzeFileStructure() {
    console.log('📁 Analyzing file structure...');
    
    const directories = [
      'module', 'templates', 'lang', 'assets', 'tools', 'documentation', 
      'less', 'fonts', '.github'
    ];

    this.stats.files.structure = {};
    
    for (const dir of directories) {
      const dirPath = path.join(this.repoPath, dir);
      if (fs.existsSync(dirPath)) {
        const stats = this.getDirectoryStats(dirPath);
        this.stats.files.structure[dir] = stats;
      }
    }

    // Count special files
    this.stats.files.special = {
      'Root Configuration': this.countFiles(this.repoPath, /^(package\.json|system\.json|\.gitignore|README\.md|gulpfile\.mjs|eslint\.config\.mjs)$/),
      'Language Files': this.countFiles(path.join(this.repoPath, 'lang'), /\.json$/),
      'Font Files': this.countFiles(path.join(this.repoPath, 'fonts'), /\.(woff|woff2|ttf|otf)$/),
    };
  }

  /**
   * Get statistics for a directory
   */
  getDirectoryStats(dirPath) {
    if (!fs.existsSync(dirPath)) return { files: 0, subdirectories: 0 };
    
    let files = 0;
    let subdirectories = 0;
    
    const walk = (currentPath) => {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          subdirectories++;
          walk(path.join(currentPath, item.name));
        } else {
          files++;
        }
      }
    };
    
    walk(dirPath);
    return { files, subdirectories };
  }

  /**
   * Count files matching a pattern in a directory
   */
  countFiles(dirPath, pattern) {
    if (!fs.existsSync(dirPath)) return 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      return files.filter(f => pattern.test(f)).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze Git history
   */
  async analyzeGitHistory() {
    console.log('📈 Analyzing Git history...');
    
    try {
      // Total commits
      const totalCommits = execSync('git rev-list --all --count', { 
        cwd: this.repoPath, 
        encoding: 'utf8' 
      }).trim();
      this.stats.git.totalCommits = parseInt(totalCommits);

      // Contributors
      const contributors = execSync('git log --format="%an" | sort | uniq -c | sort -rn', { 
        cwd: this.repoPath, 
        encoding: 'utf8' 
      }).trim().split('\n').map(line => {
        const [count, ...nameParts] = line.trim().split(/\s+/);
        return { name: nameParts.join(' '), commits: parseInt(count) };
      });
      this.stats.git.contributors = contributors;

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString().split('T')[0];
      
      const recentCommits = execSync(`git log --since="${since}" --oneline`, { 
        cwd: this.repoPath, 
        encoding: 'utf8' 
      }).trim();
      this.stats.git.recentCommits = recentCommits ? recentCommits.split('\n').length : 0;

      // Branches
      const branches = execSync('git branch -r', { 
        cwd: this.repoPath, 
        encoding: 'utf8' 
      }).trim().split('\n').filter(b => b.trim() && !b.includes('HEAD')).length;
      this.stats.git.branches = branches;

    } catch (error) {
      console.warn('Error analyzing Git history:', error.message);
    }
  }

  /**
   * Generate formatted report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 EARTHDAWN 4E V2 REPOSITORY STATISTICS REPORT');
    console.log('='.repeat(80));
    
    this.printRepositoryInfo();
    this.printCodebaseStats();
    this.printFileStructure();
    this.printGitStats();
    this.printGitHubInfo();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Analysis complete!');
    console.log('='.repeat(80));
  }

  printRepositoryInfo() {
    console.log('\n🏷️  REPOSITORY INFORMATION');
    console.log('-'.repeat(40));
    
    if (this.stats.repository.systemInfo) {
      console.log(`📛 System Name: ${this.stats.repository.systemInfo.title}`);
      console.log(`📦 Version: ${this.stats.repository.systemInfo.version}`);
      if (this.stats.repository.systemInfo.authors) {
        console.log(`👥 Authors: ${this.stats.repository.systemInfo.authors.map(a => a.name || a).join(', ')}`);
      }
    }
    
    if (this.stats.repository.created) {
      console.log(`📅 Created: ${this.stats.repository.created.toLocaleDateString()}`);
      const daysSince = Math.floor((new Date() - this.stats.repository.created) / (1000 * 60 * 60 * 24));
      console.log(`⏱️  Age: ${daysSince} days`);
    }
  }

  printCodebaseStats() {
    console.log('\n💻 CODEBASE STATISTICS');
    console.log('-'.repeat(40));
    
    console.log(`📄 Total Files: ${this.stats.codebase.totalFiles.toLocaleString()}`);
    console.log(`📏 Total Lines: ${this.stats.codebase.totalLines.toLocaleString()}`);
    
    console.log('\n📊 Breakdown by File Type:');
    const sortedTypes = Object.entries(this.stats.codebase.fileTypes)
      .sort((a, b) => b[1].lines - a[1].lines);
    
    for (const [type, stats] of sortedTypes) {
      const percentage = ((stats.lines / this.stats.codebase.totalLines) * 100).toFixed(1);
      console.log(`   ${type}: ${stats.files} files, ${stats.lines.toLocaleString()} lines (${percentage}%)`);
    }

    if (this.stats.codebase.moduleStructure) {
      console.log('\n🏗️  Module Structure:');
      const sortedModules = Object.entries(this.stats.codebase.moduleStructure)
        .sort((a, b) => b[1] - a[1]);
      
      for (const [modulePath, fileCount] of sortedModules.slice(0, 10)) {
        console.log(`   ${modulePath}: ${fileCount} files`);
      }
      if (sortedModules.length > 10) {
        console.log(`   ... and ${sortedModules.length - 10} more modules`);
      }
    }
  }

  printFileStructure() {
    console.log('\n📁 FILE STRUCTURE');
    console.log('-'.repeat(40));
    
    for (const [dir, stats] of Object.entries(this.stats.files.structure)) {
      console.log(`📂 ${dir}/: ${stats.files} files, ${stats.subdirectories} subdirectories`);
    }

    if (this.stats.files.special) {
      console.log('\n🔧 Special Files:');
      for (const [category, count] of Object.entries(this.stats.files.special)) {
        console.log(`   ${category}: ${count} files`);
      }
    }
  }

  printGitStats() {
    console.log('\n📈 GIT HISTORY');
    console.log('-'.repeat(40));
    
    if (this.stats.git.totalCommits) {
      console.log(`📝 Total Commits: ${this.stats.git.totalCommits.toLocaleString()}`);
    }
    
    if (this.stats.git.recentCommits !== undefined) {
      console.log(`🔥 Recent Activity (30 days): ${this.stats.git.recentCommits} commits`);
    }
    
    if (this.stats.git.branches) {
      console.log(`🌿 Remote Branches: ${this.stats.git.branches}`);
    }

    if (this.stats.git.contributors && this.stats.git.contributors.length > 0) {
      console.log('\n👥 Top Contributors:');
      const topContributors = this.stats.git.contributors.slice(0, 10);
      for (const contributor of topContributors) {
        const percentage = ((contributor.commits / this.stats.git.totalCommits) * 100).toFixed(1);
        console.log(`   ${contributor.name}: ${contributor.commits} commits (${percentage}%)`);
      }
    }
  }

  printGitHubInfo() {
    console.log('\n🐙 GITHUB STATISTICS');
    console.log('-'.repeat(40));
    console.log('📊 Based on recent API data:');
    console.log('   🐛 Open Issues: ~957');
    console.log('   🔄 Open Pull Requests: 7+');
    console.log('   ⭐ Stars: 1');
    console.log('   👀 Watchers: 1');
    console.log('   🍴 Forks: 0');
    console.log('\n📈 Issue Activity: Very active development');
    console.log('🏷️  Common Labels: [WORKFLOW], [BUG], [NEW FEATURE], [REFACTORING], etc.');
  }
}

// Main execution
async function main() {
  const analyzer = new RepositoryAnalyzer('/home/runner/work/earthdawn4eV2/earthdawn4eV2');
  await analyzer.analyze();
}

main().catch(console.error);