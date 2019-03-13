### Install Gitlab runner on Raspberry Pi
1.  Add the Gitlab official repository:

`curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash`

2. Use APT pinning:

 ```bash
 cat <<EOF | sudo tee /etc/apt/preferences.d/pin-gitlab-runner.pref
 Explanation: Prefer GitLab provided packages over the Debian native ones
 Package: gitlab-runner
 Pin: origin packages.gitlab.com
 Pin-Priority: 1001
 EOF
 ```

3. Install the latest version of GitLab Runner:

`sudo apt-get install gitlab-runner`
