# Manual LinkedIn Bio Template

This file contains a template that can be used to generate a rich bio if the LinkedIn API doesn't provide a complete summary.

## Template

```markdown
## [NAME] - [HEADLINE]

[NAME] is a [JOB_TITLE] at [COMPANY], with expertise in [SKILLS_LIST].

Previously, they worked as [PREVIOUS_JOB] at [PREVIOUS_COMPANY], where they gained experience in [PREVIOUS_SKILLS].

Their educational background includes [DEGREE] in [FIELD] from [UNIVERSITY].

Key skills include: [TOP_SKILLS].
```

## Example Implementation

In the `extractBioFromLinkedIn` function, you can create a rich bio by filling in the template with data from various profile fields:

```typescript
// If no summary is available, create a rich bio from available profile data
if (!englishBio && profileData.name && profileData.experiences?.length > 0) {
    const exp = profileData.experiences[0];
    const prevExp = profileData.experiences[1];
    const education = profileData.education?.[0];
    
    let richBio = `${profileData.name} is a ${exp.title || 'professional'} at ${exp.company || 'a company'}`;
    
    // Add skills if available
    if (profileData.skills?.length > 0) {
        const topSkills = profileData.skills.slice(0, 5).map(s => s.name).filter(Boolean);
        if (topSkills.length > 0) {
            richBio += `, with expertise in ${topSkills.join(', ')}`;
        }
    }
    
    richBio += '.';
    
    // Add previous experience
    if (prevExp) {
        richBio += `\n\nPreviously, they worked as ${prevExp.title || 'a professional'} at ${prevExp.company || 'another company'}`;
        if (prevExp.description) {
            richBio += `, where ${prevExp.description.substring(0, 100)}...`;
        }
        richBio += '.';
    }
    
    // Add education
    if (education) {
        richBio += `\n\nTheir educational background includes ${education.degree || 'a degree'} in ${education.field || 'their field'} from ${education.school || 'a university'}.`;
    }
    
    englishBio = richBio;
}
```

This template can be used as a reference for creating rich bios when the LinkedIn API doesn't provide a complete summary.
