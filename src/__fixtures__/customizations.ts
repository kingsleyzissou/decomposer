import z from 'zod';

import { Customizations } from '@gen/ibcrc/zod';

export const customizations: z.infer<typeof Customizations> = {
  hostname: 'my-host',
  kernel: {
    append: 'debug',
  },
  users: [
    {
      name: 'user1',
      // prettier-ignore
      ssh_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC61wMCjOSHwbVb4VfVyl5sn497qW4PsdQ7Ty7aD6wDNZ/QjjULkDV/yW5WjDlDQ7UqFH0Sr7vywjqDizUAqK7zM5FsUKsUXWHWwg/ehKg8j9xKcMv11AkFoUoujtfAujnKODkk58XSA9whPr7qcw3vPrmog680pnMSzf9LC7J6kXfs6lkoKfBh9VnlxusCrw2yg0qI1fHAZBLPx7mW6+me71QZsS6sVz8v8KXyrXsKTdnF50FjzHcK9HXDBtSJS5wA3fkcRYymJe0o6WMWNdgSRVpoSiWaHHmFgdMUJaYoCfhXzyl7LtNb3Q+Sveg+tJK7JaRXBLMUllOlJ6ll5Hod root@localhost',
      isAdministrator: false,
    },
    {
      name: 'user2',
      // prettier-ignore
      ssh_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC61wMCjOSHwbVb4VfVyl5sn497qW4PsdQ7Ty7aD6wDNZ/QjjULkDV/yW5WjDlDQ7UqFH0Sr7vywjqDizUAqK7zM5FsUKsUXWHWwg/ehKg8j9xKcMv11AkFoUoujtfAujnKODkk58XSA9whPr7qcw3vPrmog680pnMSzf9LC7J6kXfs6lkoKfBh9VnlxusCrw2yg0qI1fHAZBLPx7mW6+me71QZsS6sVz8v8KXyrXsKTdnF50FjzHcK9HXDBtSJS5wA3fkcRYymJe0o6WMWNdgSRVpoSiWaHHmFgdMUJaYoCfhXzyl7LtNb3Q+Sveg+tJK7JaRXBLMUllOlJ6ll5Hod root@localhost',
      // prettier-ignore
      password: '$6$BhyxFBgrEFh0VrPJ$MllG8auiU26x2pmzL4.1maHzPHrA.4gTdCvlATFp8HJU9UPee4zCS9BVl2HOzKaUYD/zEm8r/OF05F2icWB0K/',
      groups: ['group1'],
      isAdministrator: false,
    },
    {
      name: 'user3',
      isAdministrator: false,
    },
  ],
  groups: [
    {
      name: 'group1',
      gid: 1030,
    },
    {
      name: 'group2',
      gid: 1050,
    },
    {
      name: 'user3',
      gid: 1060,
    },
  ],
  timezone: {
    timezone: 'Europe/London',
    ntpservers: ['time.example.com'],
  },
  locale: {
    languages: ['el_CY.UTF-8'],
    keyboard: 'dvorak',
  },
  services: {
    enabled: ['sshd.service', 'custom.service'],
    disabled: ['bluetooth.service'],
    masked: ['nfs-server', 'rpcbind', 'nftables'],
  },
  filesystem: [
    {
      min_size: 2147483648,
      mountpoint: '/home',
    },
    {
      // 500MiB
      min_size: 524288000,
      mountpoint: '/home/shadowman',
    },
    {
      // 1GiB
      min_size: 1073741824,
      mountpoint: '/foo',
    },
    {
      // 4GiB,
      min_size: 4294967296,
      mountpoint: '/usr',
    },
    {
      // 1GiB
      min_size: 1073741824,
      mountpoint: '/opt',
    },
    {
      // 1GiB
      min_size: 1073741824,
      mountpoint: '/media',
    },
    {
      // 1 GiB
      min_size: 1073741824,
      mountpoint: '/root',
    },
    {
      // 1 GiB
      min_size: 1073741824,
      mountpoint: '/srv',
    },
    {
      // 1 GiB
      min_size: 1073741824,
      mountpoint: '/mnt',
    },
  ],
  directories: [
    {
      path: '/etc/systemd/system/custom.service.d',
    },
    {
      path: '/etc/custom_dir',
      mode: '0770',
      user: 1020,
      group: 1050,
    },
  ],
  files: [
    {
      path: '/etc/systemd/system/custom.service',
      data: '[Unit]\nDescription=Custom service\n\n[Service]\nExecStart=/usr/bin/false\n\n[Install]\nWantedBy=multi-user.target\n',
    },
    {
      path: '/etc/systemd/system/custom.service.d/override.conf',
      data: '[Service]\nExecStart=\nExecStart=/usr/bin/cat /etc/custom_file.txt\n',
    },
    {
      path: '/etc/custom_file.txt',
      data: 'image builder is the best',
      mode: '0644',
      user: 'root',
      group: 'root',
    },
    {
      path: '/etc/empty_file.txt',
      user: 0,
      group: 0,
    },
  ],
  firewall: {
    services: {
      enabled: ['ftp'],
      disabled: ['telnet'],
    },
    ports: ['1337:udp', '42-48:tcp'],
  },
  custom_repositories: [
    {
      baseurl: ['https://example.com/download/yum'],
      id: 'example',
      name: 'Example repo',
      gpgcheck: true,
      enabled: true,
      repo_gpgcheck: false,
      gpgkeys: [
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQGiBGRBSJURBACzCoe9UNfxOUiFLq9b60weSBFdr39mLViscecDWATNvXtgRoK/\nxl/4qpayzALRCQ2Ek/pMrbKPF/3ngECuBv7S+rI4n/rIia4FNcqzYeZAz4DE4NP/\neUGvz49tWhmH17hX/rmF9kz5kLq2bDZI4GDgZW/oMDdt2ivj092Ljm9jRwCgyQy3\nWEK6RJvIcSEh9vbdwVdMPOcD/iHqNejTMFwGyZfCWB0eIOoxUOUn/ZZpELTL2UpW\nGduCf3txb5SkK7M+WDbb0S5IvNXoi0tc13STiD6Oxg2O9PkSvvYb+8zxlhNoSTwy\n54j7Rf5FlnQ3TAFfjtQ5LCx56LKK73j4RjvKW//ktm5n54exsgo9Ry/e12T46dRg\n7tIlA/91rzLm57Qyc73A7zjgIzef9O6V5ZzowC+pp/jfb5pS9hXgROekLkMgX0vg\niA5rM5OpqK4bArVP1lRWnLyvghwO+TW763RVuXlS0scfzMy4g0NgrG6j7TIOKEqz\n4xQxOuwkudqiQr/kOqKuLxQBXa+5MJkyhfPmqYw5wpqyCwFa/7Q4b3NidWlsZCB0\nZXN0IChvc2J1aWxkIHRlc3QgZ3Bna2V5KSA8b3NidWlsZEBleGFtcGxlLmNvbT6I\newQTEQIAOxYhBGB8woiEPRKBO8Cr31lulpQgMejzBQJkQUiVAhsjBQsJCAcCAiIC\nBhUKCQgLAgQWAgMBAh4HAheAAAoJEFlulpQgMejzapMAoLmUg1mNDTRUaCrN/fzm\nHYLHL6jkAJ9pEKkJQiHB6SfD0fkiD2GkELYLubkBDQRkQUiVEAQAlAAXrQ572vuw\nxI3W8GSZmOQiAYOQmOKRloLEy6VZ3NSOb9y2TXj33QTkJBPOM17AzB7E+YjZrpUt\ngl6LlXmfjMcJAcXhFaUBCilAcMwMlLl7DtnSkLnLIXYmHiN0v83BH/H0EPutOc5l\n0QIyugutifp9SJz2+EWpC4bjA7GFkQ8AAwUD/1tLEGqCJ37O8gfzYt2PWkqBEoOY\n0Z3zwVS6PWW/IIkak9dAJ0iX5NMeFWpzFNfviDPHqhEdUR55zsxyUZIZlCX5jwmA\nt7qm3cbH4HNU1Ogq3Q9hykbTPWPZVkpvNm/TO8TA2brhkz3nuS8Hbmh+rjXFOSZj\nDQBUxItuuj2hhpQEiGAEGBECACAWIQRgfMKIhD0SgTvAq99ZbpaUIDHo8wUCZEFI\nlQIbDAAKCRBZbpaUIDHo83fQAKDHgFIaggaNsvDQkj7vMX0fecHRhACfS9Bvxn2W\nWSb6T+gChmYBseZwk/k=\n=DQ3i\n-----END PGP PUBLIC KEY BLOCK-----\n',
      ],
    },
  ],
  packages: ['bash', 'bluez'],
};

export const name = 'test-conversion-customizations';
