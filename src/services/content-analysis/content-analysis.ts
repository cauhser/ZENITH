import { ContentAnalysisResult, EmotionalImpact, ContentType } from '../../types/emotion';

export interface ContentAnalysisConfig {
  emotionalImpactThreshold: number;
  attentionThreshold: number;
  sentimentWeight: number;
  engagementWeight: number;
}

export interface WebContent {
  url: string;
  title: string;
  content: string;
  metadata?: {
    contentType?: string;
    readingTime?: number;
    wordCount?: number;
  };
}

export class ContentAnalysisService {
  private config: ContentAnalysisConfig;

  constructor(config?: Partial<ContentAnalysisConfig>) {
    this.config = {
      emotionalImpactThreshold: 0.7,
      attentionThreshold: 0.6,
      sentimentWeight: 0.4,
      engagementWeight: 0.6,
      ...config
    };
  }

  /**
   * Analyze web content for emotional impact and wellness recommendations
   */
  async analyzeContent(content: WebContent): Promise<ContentAnalysisResult> {
    try {
      const emotionalImpact = await this.analyzeEmotionalImpact(content);
      const attentionMetrics = this.calculateAttentionMetrics(content);
      const wellnessScore = this.calculateWellnessScore(emotionalImpact, attentionMetrics);
      const recommendations = this.generateRecommendations(wellnessScore, emotionalImpact, content);

      return {
        contentId: this.generateContentId(content.url),
        url: content.url,
        timestamp: new Date().toISOString(),
        emotionalImpact,
        attentionMetrics,
        wellnessScore,
        recommendations,
        contentType: this.detectContentType(content),
        analysisConfidence: this.calculateConfidence(content)
      };
    } catch (error) {
      console.error('Content analysis error:', error);
      throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze emotional impact of content
   */
  private async analyzeEmotionalImpact(content: WebContent): Promise<EmotionalImpact> {
    // Analyze sentiment and emotional tone
    const sentiment = this.analyzeSentiment(content.content);
    const emotionalTone = this.extractEmotionalTone(content.content);
    const intensity = this.calculateEmotionalIntensity(content.content);

    return {
      sentiment: sentiment.score,
      sentimentLabel: sentiment.label,
      emotionalTone,
      intensity,
      triggers: this.detectEmotionalTriggers(content.content),
      positivityScore: this.calculatePositivityScore(content.content)
    };
  }

  /**
   * Calculate attention and engagement metrics
   */
  private calculateAttentionMetrics(content: WebContent) {
    const readingTime = content.metadata?.readingTime || this.estimateReadingTime(content.content);
    const complexity = this.analyzeContentComplexity(content.content);

    return {
      estimatedReadingTime: readingTime,
      contentComplexity: complexity,
      engagementPotential: this.calculateEngagementPotential(content),
      focusRequired: this.calculateFocusRequirement(complexity, content.content.length),
      scanability: this.analyzeScanability(content.content)
    };
  }

  /**
   * Generate wellness recommendations based on content analysis
   */
  private generateRecommendations(
    wellnessScore: number,
    emotionalImpact: EmotionalImpact,
    content: WebContent
  ): string[] {
    const recommendations: string[] = [];

    // Emotional impact based recommendations
    if (emotionalImpact.intensity > 0.8) {
      recommendations.push('High emotional content detected. Consider taking breaks while consuming this material.');
    }

    if (emotionalImpact.sentiment < -0.5) {
      recommendations.push('Negative content detected. Balance with positive material for emotional well-being.');
    }

    // Content complexity recommendations
    const attentionMetrics = this.calculateAttentionMetrics(content);
    if (attentionMetrics.focusRequired > 0.7) {
      recommendations.push('Complex content detected. Ensure you are in a focused environment for better comprehension.');
    }

    // Reading time recommendations
    if (attentionMetrics.estimatedReadingTime > 10) {
      recommendations.push('Long content detected. Consider using the Pomodoro technique with 25-minute focused sessions.');
    }

    // Wellness score based recommendations
    if (wellnessScore < 0.3) {
      recommendations.push('This content may impact your well-being negatively. Consider limiting exposure.');
    } else if (wellnessScore > 0.7) {
      recommendations.push('This content appears beneficial for your well-being.');
    }

    // Add general wellness practices
    recommendations.push(
      'Remember to practice mindful consumption and take regular breaks.',
      'Stay hydrated and maintain good posture while reading.'
    );

    return recommendations;
  }

  /**
   * Calculate overall wellness score (0-1, where 1 is most beneficial)
   */
  private calculateWellnessScore(
    emotionalImpact: EmotionalImpact,
    attentionMetrics: any
  ): number {
    const sentimentScore = (emotionalImpact.sentiment + 1) / 2; // Normalize to 0-1
    const positivityScore = emotionalImpact.positivityScore;
    const engagementScore = attentionMetrics.engagementPotential;
    const complexityPenalty = 1 - (attentionMetrics.contentComplexity * 0.3); // Reduce penalty for complexity

    const baseScore = (
      sentimentScore * this.config.sentimentWeight +
      positivityScore * 0.3 +
      engagementScore * this.config.engagementWeight
    ) / (this.config.sentimentWeight + 0.3 + this.config.engagementWeight);

    return Math.max(0, Math.min(1, baseScore * complexityPenalty));
  }

  /**
   * Analyze content sentiment (-1 to 1)
   */
  private analyzeSentiment(text: string): { score: number; label: string } {
    // Simple sentiment analysis (in practice, you might use a more sophisticated library)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'happy', 'joy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'sad', 'angry', 'hate'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const totalRelevant = positiveCount + negativeCount;
    if (totalRelevant === 0) {
      return { score: 0, label: 'neutral' };
    }

    const score = (positiveCount - negativeCount) / totalRelevant;
    
    let label = 'neutral';
    if (score > 0.3) label = 'positive';
    else if (score < -0.3) label = 'negative';

    return { score, label };
  }

  /**
   * Extract emotional tone from content
   */
  private extractEmotionalTone(text: string): Record<string, number> {
    const emotionalCategories = {
      joy: ['happy', 'joy', 'excited', 'pleased', 'delighted'],
      sadness: ['sad', 'unhappy', 'depressed', 'grief', 'mourn'],
      anger: ['angry', 'mad', 'furious', 'outraged', 'annoyed'],
      fear: ['scared', 'afraid', 'fearful', 'terrified', 'anxious'],
      surprise: ['surprised', 'amazed', 'astonished', 'shocked']
    };

    const tone: Record<string, number> = {};
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    Object.entries(emotionalCategories).forEach(([emotion, triggers]) => {
      const count = words.filter(word => triggers.includes(word)).length;
      tone[emotion] = count / totalWords;
    });

    return tone;
  }

  /**
   * Calculate emotional intensity
   */
  private calculateEmotionalIntensity(text: string): number {
    const intenseWords = [
      'extremely', 'very', 'really', 'absolutely', 'completely',
      'utterly', 'totally', ' intensely', 'profoundly'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const intenseCount = words.filter(word => intenseWords.includes(word)).length;
    
    return Math.min(1, intenseCount / (words.length * 0.1)); // Normalize
  }

  /**
   * Detect potential emotional triggers
   */
  private detectEmotionalTriggers(text: string): string[] {
    const commonTriggers = [
      'trauma', 'abuse', 'violence', 'death', 'loss', 'failure',
      'rejection', 'humiliation', 'betrayal', 'abandonment'
    ];

    return commonTriggers.filter(trigger => 
      text.toLowerCase().includes(trigger.toLowerCase())
    );
  }

  /**
   * Calculate positivity score
   */
  private calculatePositivityScore(text: string): number {
    const positivePatterns = [
      /success/g, /achievement/g, /growth/g, /improve/g, /benefit/g,
      /positive/g, /optimistic/g, /hopeful/g, /grateful/g, /thankful/g
    ];

    const negativePatterns = [
      /failure/g, /problem/g, /issue/g, /difficulty/g, /challenge/g,
      /negative/g, /pessimistic/g, /hopeless/g, /complaint/g
    ];

    let positiveMatches = 0;
    let negativeMatches = 0;

    positivePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) positiveMatches += matches.length;
    });

    negativePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) negativeMatches += matches.length;
    });

    const total = positiveMatches + negativeMatches;
    return total === 0 ? 0.5 : positiveMatches / total;
  }

  /**
   * Estimate reading time in minutes
   */
  private estimateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Analyze content complexity
   */
  private analyzeContentComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;

    const words = text.split(/\s+/);
    const averageSentenceLength = words.length / sentences.length;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;

    // Normalize to 0-1 scale
    const complexity = (averageSentenceLength * 0.5 + longWordRatio * 0.5) / 20;
    return Math.min(1, complexity);
  }

  /**
   * Calculate engagement potential
   */
  private calculateEngagementPotential(content: WebContent): number {
    const titleEngagement = content.title ? Math.min(1, content.title.length / 50) : 0.5;
    const contentEngagement = Math.min(1, content.content.length / 1000);
    const metadataBonus = content.metadata ? 0.1 : 0;

    return (titleEngagement * 0.4 + contentEngagement * 0.6) + metadataBonus;
  }

  /**
   * Calculate focus requirement
   */
  private calculateFocusRequirement(complexity: number, contentLength: number): number {
    const lengthFactor = Math.min(1, contentLength / 5000);
    return (complexity * 0.7 + lengthFactor * 0.3);
  }

  /**
   * Analyze how scannable the content is
   */
  private analyzeScanability(text: string): number {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (paragraphs.length === 0 || sentences.length === 0) return 0.5;

    const avgSentencesPerParagraph = sentences.length / paragraphs.length;
    const avgSentenceLength = text.length / sentences.length;

    // Lower sentences per paragraph and moderate sentence length = more scannable
    const paragraphScore = Math.max(0, 1 - (avgSentencesPerParagraph / 10));
    const sentenceScore = Math.max(0, 1 - Math.abs(avgSentenceLength - 100) / 100);

    return (paragraphScore + sentenceScore) / 2;
  }

  /**
   * Detect content type
   */
  private detectContentType(content: WebContent): ContentType {
    const text = (content.title + ' ' + content.content).toLowerCase();
    
    if (text.includes('news') || text.includes('article')) return 'article';
    if (text.includes('blog') || text.includes('post')) return 'blog';
    if (text.includes('social') || text.includes('media')) return 'social';
    if (text.includes('email') || text.includes('message')) return 'email';
    if (text.includes('academic') || text.includes('research')) return 'academic';
    
    return 'webpage';
  }

  /**
   * Calculate analysis confidence
   */
  private calculateConfidence(content: WebContent): number {
    const contentLength = content.content.length;
    const titlePresent = content.title && content.title.length > 0 ? 0.2 : 0;
    
    if (contentLength < 50) return 0.3 + titlePresent;
    if (contentLength < 200) return 0.6 + titlePresent;
    if (contentLength < 1000) return 0.8 + titlePresent;
    
    return 0.9 + titlePresent;
  }

  /**
   * Generate unique content ID
   */
  private generateContentId(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 16);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ContentAnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ContentAnalysisConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const contentAnalysisService = new ContentAnalysisService();

// Utility function for quick analysis
export const analyzeContent = (content: WebContent) => {
  return contentAnalysisService.analyzeContent(content);
};