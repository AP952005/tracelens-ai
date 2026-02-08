import { BreachRecord } from '@root/types/investigation';

export async function checkBreaches(query: string): Promise<BreachRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // More comprehensive breach database with realistic data
    const datasets = [
        {
            domain: 'linkedin.com',
            date: '2021-06-22',
            dataClasses: ['Email', 'Job Title', 'LinkedIn Profile'],
            dataTypes: ['email', 'professional'],
            risk: 45,
            description: 'Professional data exposed including work history and connections'
        },
        {
            domain: 'adobe.com',
            date: '2013-10-04',
            dataClasses: ['Email', 'Password Hint', 'Username', 'Encrypted Password'],
            dataTypes: ['email', 'password', 'username'],
            risk: 75,
            description: 'Major breach exposing 153M accounts with weakly encrypted passwords'
        },
        {
            domain: 'canva.com',
            date: '2019-05-24',
            dataClasses: ['Email', 'Name', 'City', 'Country'],
            dataTypes: ['email', 'address'],
            risk: 35,
            description: '139M user records exposed including geographic location data'
        },
        {
            domain: 'verifications.io',
            date: '2019-02-25',
            dataClasses: ['Email', 'Phone', 'IP Address', 'Full Name', 'DOB'],
            dataTypes: ['email', 'phone', 'dob'],
            risk: 65,
            description: '763M records exposed from unprotected MongoDB, includes verification data'
        },
        {
            domain: 'exploit.in',
            date: '2016-10-13',
            dataClasses: ['Email', 'Password Hash', 'Username'],
            dataTypes: ['email', 'password', 'username'],
            risk: 85,
            description: 'Dark web compilation containing credentials from multiple breaches'
        },
        {
            domain: 'dropbox.com',
            date: '2012-07-11',
            dataClasses: ['Email', 'Password', 'Username'],
            dataTypes: ['email', 'password', 'username'],
            risk: 80,
            description: '68M accounts exposed with SHA-1 hashed passwords'
        },
        {
            domain: 'myspace.com',
            date: '2008-03-01',
            dataClasses: ['Email', 'Username', 'Password'],
            dataTypes: ['email', 'password', 'username'],
            risk: 60,
            description: 'Legacy breach affecting 360M accounts from defunct social network'
        },
        {
            domain: 'facebook.com',
            date: '2019-04-03',
            dataClasses: ['Phone', 'Email', 'Full Name', 'Location'],
            dataTypes: ['phone', 'email', 'address'],
            risk: 70,
            description: '540M records exposed on unsecured servers by third-party developers'
        }
    ];

    // Deterministic but varied selection based on query
    const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const breachCount = (hash % 5) + 1; // 1-5 breaches
    const shuffled = datasets.sort((a, b) => {
        const aHash = (hash + a.domain.charCodeAt(0)) % 10;
        const bHash = (hash + b.domain.charCodeAt(0)) % 10;
        return aHash - bHash;
    });

    const breaches: BreachRecord[] = shuffled.slice(0, breachCount).map(dataset => ({
        domain: dataset.domain,
        date: dataset.date,
        dataClasses: dataset.dataClasses,
        dataTypes: dataset.dataTypes,
        verified: true,
        description: dataset.description,
        riskScore: dataset.risk
    }));

    return breaches;
}
