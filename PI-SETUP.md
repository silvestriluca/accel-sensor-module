# Running on a Raspberry-Pi : step-by-step setup

## A. Install OS on Raspberry 
1. Download the latest Raspbian image (**Raspbian Stretch Lite** will work) from official Raspberry-Pi website: [https://www.raspberrypi.org/downloads/raspbian/](https://www.raspberrypi.org/downloads/raspbian/)
2. Download and install the **Etcher** flashing utility: [https://etcher.io](https://etcher.io)
3. Flash the Raspbian image using Etcher on a MicroSD card (8GB card is enough)
4. Once flashing is done, open the SD **boot** partition with Finder/Windows File Explorer and create an empty text file called `ssh` (without extensions)
5. Hook up an ethernet cable to the Raspberry, connect it to a router/switch and turn Raspberry on by plugging it to a 5V power brick (use a high quality one, like **3000mA or greater** output).
6. After 1-2 minutes you should be able to detect the Raspberry in the list of connected devices and find its **local IP** (e.g. looking at router table of connected devices).
7. SSH to raspberry: 

    `ssh pi@<IP Address>` - Default password is `raspberry`.

8. Update raspbian software: 

    `sudo apt-get update` and `sudo apt-get upgrade`

9. Reboot Raspberry and log back in:

    `sudo reboot`

    `ssh pi@<IP Address>` - Default password is `raspberry`.

10. Configure locale, wifi, change default password and enable I2C via the config utility: 

    `sudo raspi-config`

11. Reboot Raspberry:

    `sudo reboot`

12. Once the wifi is configured, it is possible to access to Raspberry thorugh its **wifi IP address** and the Ethernet cabled connection is not necessary anymore.

    `ssh pi@<WiFi IP Address>` - Default password is `raspberry`.

13. When finished using the Raspberry, shut it down before unplugging power brick:

    `sudo shutdown now`

## B. Install Node on Raspberry
Node can be installed in many ways. The suggested way is by using the precompiled package available by Nodesource repository. Their packages are always updated after few hours from the release of new official source files.

The following commands will add Nodesource official repositories and install the latest Node 10(LTS) version:
1. `curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`

2. `sudo apt-get install -y nodejs`

3. To check that everything has been properly installed

    `node -v`

    `npm -v` 

## C. Install the kernel modules for working with an MPU-6050 based accelerometer/gyroscope
MPU-6050 it's mounted on an I2C board so first you need to install the relevant Linux drivers, here's how. 
1. `sudo nano /etc/modules`
2. Add the following lines to the bottom of the file and save it:
    ```
    i2c-bcm2708
    i2c-dev
    ```
3. Reboot the Pi:

    `sudo reboot`

4. Now check the blacklists file

    `sudo nano /etc/modprobe.d/raspi-blacklist.conf`

    and make sure that the following lines start with a # (a comment) if they are present, if not don't worry

    ```
    #blacklist spi-bcm2708
    #blacklist i2c-bcm2708
    ```

5. Reboot the Pi:

    `sudo reboot`

## <a name="certificates"></a> D. Generate and install AWS IoT Certificates
1. From **AWS Management Console** select "IoT Core" and load the IoT dashboard;
2. Secure > Policies
3. Create a new policy. Name it `virtual-truck-policy`.
  This is the policy in JSON (you can generate it with the visual editor).
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "iot:Connect",
          "Resource": "arn:aws:iot:eu-west-1:<YOUR AWS ACCOUNT NUMBER HERE>:client/*"
        },
        {
          "Effect": "Allow",
          "Action": "iot:Publish",
          "Resource": "arn:aws:iot:eu-west-1:<YOUR AWS ACCOUNT NUMBER HERE>:topic/*"
        }
      ]
    }
    ```
    **WARNING** : Due the loose permissions on the policy, it is valid only for a prototyping setup.
4. Secure > Certificates > One click certificate > Create certificate
5. Download the ca-certificate (RSA 2048 bit key) from the following link: [https://www.amazontrust.com/repository/AmazonRootCA1.pem](https://www.amazontrust.com/repository/AmazonRootCA1.pem) => name it `root-ca.pem`
6. The certificates have to be renamed / named as follows:

```
ca-certificate => root-ca.pem
xxxxxxxxxx-certificate.pem.crt => certificate.pem.crt
xxxxxxxxxx-private.pem.key => private.pem.key
xxxxxxxxxx-public.pem.key => public.pem.key
```
7. Put them in a folder named `certs`
8. To copy the certificates on Raspberry issue the following command from the terminal in the `certs` folder:

    `scp *.* pi@<Rapsberry IP>:certs`
9. Now the certificates are on Raspberry device, inside the `~/certs` folder.
10. SSH into Raspberry and then => `mkdir .config/read-mpu`
11. `cp certs .config/read-mpu/certs`
12. All the certificate will be located in `~/.config/read-mpu/certs`

## E. Connect MPU-6050 module to Raspberry.
Instruction to wire the module to a RaspberryPi and to test the connection can be found on [this blog post](http://blog.bitify.co.uk/2013/11/interfacing-raspberry-pi-and-mpu-6050.html)