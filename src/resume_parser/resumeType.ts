export interface Resume {
  ParsingResponse: ParsingResponse;
  ResumeData: ResumeData;
  RedactedResumeData: RedactedResumeData;
  ConversionMetadata: ConversionMetadata;
  ParsingMetadata: ParsingMetadata;
}
export interface ParsingResponse {
  Code: string;
  Message: string;
}
export interface ResumeData {
  ContactInformation: ContactInformation;
  ProfessionalSummary: string;
  Education: Education;
  EmploymentHistory: EmploymentHistory;
  Skills: Skills;
  Certifications?: CertificationsEntity[] | null;
  LanguageCompetencies?: LanguageCompetenciesEntity[] | null;
  References?: ReferencesEntity[] | null;
  QualificationsSummary: string;
  ResumeMetadata: ResumeMetadata;
}
export interface ContactInformation {
  CandidateName: CandidateName;
  Telephones?: TelephonesEntity[] | null;
  EmailAddresses?: string[] | null;
  WebAddresses?: WebAddressesEntity[] | null;
}
export interface CandidateName {
  FormattedName: string;
  GivenName: string;
  FamilyName: string;
}
export interface TelephonesEntity {
  Raw: string;
  Normalized: string;
  InternationalCountryCode: string;
  SubscriberNumber: string;
}
export interface WebAddressesEntity {
  Address: string;
  Type: string;
}
export interface Education {
  EducationDetails?: EducationDetailsEntity[] | null;
}
export interface EducationDetailsEntity {
  Id: string;
  Text: string;
  SchoolName: SchoolNameOrTelephonesEntity;
  SchoolType: string;
  LastEducationDate: LastEducationDateOrStartDateOrEndDate;
  StartDate: LastEducationDateOrStartDateOrEndDate;
  EndDate: LastEducationDateOrStartDateOrEndDate;
  Majors?: string[] | null;
  GPA?: GPA | null;
}
export interface SchoolNameOrTelephonesEntity {
  Raw: string;
  Normalized: string;
}
export interface LastEducationDateOrStartDateOrEndDate {
  Date: string;
  IsCurrentDate: boolean;
  FoundYear: boolean;
  FoundMonth: boolean;
  FoundDay: boolean;
}
export interface GPA {
  Score: string;
  ScoringSystem: string;
  MaxScore: string;
  MinimumScore: string;
  NormalizedScore: number;
}
export interface EmploymentHistory {
  ExperienceSummary: ExperienceSummary;
  Positions?: PositionsEntity[] | null;
}
export interface ExperienceSummary {
  Description: string;
  MonthsOfWorkExperience: number;
  MonthsOfManagementExperience: number;
  ExecutiveType: string;
  AverageMonthsPerEmployer: number;
  FulltimeDirectHirePredictiveIndex: number;
  ManagementStory: string;
  CurrentManagementLevel: string;
  ManagementScore: number;
}
export interface PositionsEntity {
  Id: string;
  Employer: Employer;
  RelatedToByCompanyName?: string[] | null;
  IsSelfEmployed: boolean;
  IsCurrent: boolean;
  JobTitle: JobTitle;
  StartDate: LastEducationDateOrStartDateOrEndDate;
  EndDate: LastEducationDateOrStartDateOrEndDate;
  JobType: string;
  JobLevel: string;
  TaxonomyPercentage: number;
  Description: string;
}
export interface Employer {
  Name: NameOrJobTitle;
}
export interface NameOrJobTitle {
  Probability: string;
  Raw: string;
  Normalized: string;
}
export interface JobTitle {
  Raw: string;
  Normalized: string;
  Probability: string;
  Variations?: string[] | null;
}
export interface Skills {
  Raw?: RawEntity[] | null;
  Normalized?: NormalizedEntity[] | null;
  RelatedProfessionClasses?: RelatedProfessionClassesEntity[] | null;
}
export interface RawEntity {
  Name: string;
  FoundIn?: FoundInEntityOrSectionIdentifiersEntity[] | null;
  MonthsExperience?: MonthsExperience | null;
  LastUsed?: LastUsed | null;
}
export interface FoundInEntityOrSectionIdentifiersEntity {
  SectionType: string;
  Id?: string | null;
}
export interface MonthsExperience {
  Value: number;
}
export interface LastUsed {
  Value: string;
}
export interface NormalizedEntity {
  Name: string;
  Id: string;
  Type: string;
  FoundIn?: FoundInEntityOrSectionIdentifiersEntity[] | null;
  MonthsExperience?: MonthsExperience1 | null;
  LastUsed?: LastUsed1 | null;
  RawSkills?: string[] | null;
}
export interface MonthsExperience1 {
  Value: number;
}
export interface LastUsed1 {
  Value: string;
}
export interface RelatedProfessionClassesEntity {
  Name: string;
  Id: string;
  Percent: number;
  Groups?: GroupsEntity[] | null;
}
export interface GroupsEntity {
  Name: string;
  Id: string;
  Percent: number;
  NormalizedSkills?: string[] | null;
}
export interface CertificationsEntity {
  Name: string;
  MatchedFromList: boolean;
  IsVariation: boolean;
}
export interface LanguageCompetenciesEntity {
  Language: string;
  LanguageCode: string;
  FoundInContext: string;
}
export interface ReferencesEntity {
  ReferenceName: ReferenceName;
  Title: string;
  Company: string;
  Location: Location;
  Telephones?: SchoolNameOrTelephonesEntity[] | null;
}
export interface ReferenceName {
  FormattedName?: string | null;
  GivenName?: string | null;
  MiddleName?: string | null;
  FamilyName?: string | null;
}
export interface Location {
  CountryCode: string;
  StreetAddressLines?: string[] | null;
}
export interface ResumeMetadata {
  FoundSections?: FoundSectionsEntity[] | null;
  ResumeQuality?: ResumeQualityEntity[] | null;
  ReservedData: ReservedData;
  PlainText: string;
  DocumentLanguage: string;
  DocumentCulture: string;
  ParserSettings: string;
  DocumentLastModified: string;
}
export interface FoundSectionsEntity {
  FirstLineNumber: number;
  LastLineNumber: number;
  SectionType: string;
  HeaderTextFound: string;
}
export interface ResumeQualityEntity {
  Level: string;
  Findings?: FindingsEntity[] | null;
}
export interface FindingsEntity {
  QualityCode: string;
  SectionIdentifiers?: FoundInEntityOrSectionIdentifiersEntity[] | null;
  Message: string;
}
export interface ReservedData {
  Phones?: string[] | null;
  Names?: string[] | null;
  EmailAddresses?: string[] | null;
  Urls?: string[] | null;
}
export interface RedactedResumeData {
  ContactInformation: ReferenceNameOrContactInformation;
  ProfessionalSummary: string;
  Education: Education;
  EmploymentHistory: EmploymentHistory;
  Skills: Skills;
  Certifications?: CertificationsEntity[] | null;
  LanguageCompetencies?: LanguageCompetenciesEntity[] | null;
  QualificationsSummary: string;
  ResumeMetadata: ResumeMetadata1;
}
export interface ReferenceNameOrContactInformation {}
export interface ResumeMetadata1 {
  FoundSections?: FoundSectionsEntity[] | null;
  ResumeQuality?: ResumeQualityEntity[] | null;
  PlainText: string;
  DocumentLanguage: string;
  DocumentCulture: string;
  ParserSettings: string;
  DocumentLastModified: string;
}
export interface ConversionMetadata {
  DetectedType: string;
  SuggestedFileExtension: string;
  OutputValidityCode: string;
  ElapsedMilliseconds: number;
  DocumentHash: string;
}
export interface ParsingMetadata {
  ElapsedMilliseconds: number;
  TimedOut: boolean;
}

export interface ParsedResume {
  email: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  totalWorkExperience: number;
  workExperiences: WorkExperience[];
  workSummary: {
    Description: string;
  };
  skills: string[];
  companies: string[];
}

export interface WorkExperience {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string;
  months: number;
}

export interface SkillCount {
  skill: {
    skill: string;
    weight: number;
  };
  count: number;
}

export interface SkillScore {
  email: string;
  skillCounts: SkillCount[];
  skillCountsAverage: number;
}
