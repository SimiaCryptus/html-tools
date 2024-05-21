document.getElementById('check-versions').addEventListener('click', async () => {
    const requirements = document.getElementById('requirements-input').value;
    console.log('Requirements input:', requirements);
    const packages = requirements.split('\n')
        .map(line => line.split('#')[0].trim()) // Remove comments and trim whitespace
        .filter(line => line !== ''); // Filter out empty lines

    console.log('Parsed packages:', packages);

    const results = document.getElementById('results');
    results.innerHTML = '<p class="loading">Fetching latest versions...</p>';

    const fetchPackageVersion = async (packageName) => {
        console.log(`Fetching version for package: ${packageName}`);
        try {
            const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Fetched data for ${packageName}:`, data);
                return data.info;
            } else {
                console.error(`Error fetching version for ${packageName}: ${response.statusText}`);
                return { error: `Error fetching version for ${packageName}: ${response.statusText}` };
            }
        } catch (error) {
            console.error(`Error fetching version for ${packageName}: ${error.message}`);
            return { error: `Error fetching version for ${packageName}: ${error.message}` };
        }
    };

    const packageVersions = await Promise.all(packages.map(async (pkg) => {
        const packageName = pkg.split('==')[0].trim();
        console.log(`Processing package: ${packageName}`);
        const packageInfo = await fetchPackageVersion(packageName);
        console.log(`Fetched info for ${packageName}:`, packageInfo);
        return { packageName, packageInfo };
    }));

    const escapeHtml = (unsafe) => {
        if (null == unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    console.log('Package versions:', packageVersions);

    let resultsHtml = '<table><thead><tr><th>Package</th><th>Latest Version</th></tr></thead><tbody>';
    packageVersions.forEach(({ packageName, packageInfo }) => {
        if (packageInfo.error) {
            console.error(`Error for package ${packageName}:`, packageInfo.error);
            resultsHtml += `<tr><td>${escapeHtml(packageName)}</td><td>${escapeHtml(packageInfo.error)}</td></tr>`;
        } else {
            console.log(`Adding row for package ${packageName} with version ${packageInfo.version}`);
            resultsHtml += `<tr class="package-row" data-package='${escapeHtml(JSON.stringify(packageInfo))}'><td>${escapeHtml(packageName)}</td><td>${escapeHtml(packageInfo.version)}</td></tr>`;
        }
    });
    resultsHtml += '</tbody></table>';
    results.innerHTML = resultsHtml;

    console.log('Package versions:', packageVersions);

    document.querySelectorAll('.package-row').forEach(row => {
        row.addEventListener('click', () => {
            const packageInfo = JSON.parse(row.getAttribute('data-package'));
            console.log('Package row clicked:', packageInfo);
            const modal = document.getElementById('modal');
            const modalDetails = document.getElementById('modal-details');
            modalDetails.innerHTML = `
                <h2>${escapeHtml(packageInfo.name)}</h2>
                <p><strong>Version:</strong> ${escapeHtml(packageInfo.version)}</p>
                <p><strong>Summary:</strong> ${escapeHtml(packageInfo.summary)}</p>
                <p><strong>Author:</strong> ${escapeHtml(packageInfo.author)}</p>
                <p><strong>Author Email:</strong> ${escapeHtml(packageInfo.author_email)}</p>
                <p><strong>License:</strong> ${escapeHtml(packageInfo.license)}</p>
                <p><strong>Home Page:</strong> <a href="${escapeHtml(packageInfo.home_page)}" target="_blank">${escapeHtml(packageInfo.home_page)}</a></p>
            `;
            modal.style.display = 'block';
        });
    });

    document.querySelector('.close').addEventListener('click', () => {
        console.log('Modal close button clicked');
        document.getElementById('modal').style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal');
        if (event.target == modal) {
            console.log('Window clicked outside modal');
            modal.style.display = 'none';
        }
    });
});